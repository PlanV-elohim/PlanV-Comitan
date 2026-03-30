import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Home, User as UserIcon, Loader2, GripVertical, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

type Participant = {
    id: string; // unique string for dnd
    db_id: string;
    type: 'main' | 'member';
    first_name: string;
    last_name: string;
    gender: string;
    cabin_id: number | null;
    camp_id: number;
    medical_cleared: boolean;
};

// --- Sortable Item Component ---
function SortableParticipant({ participant }: { participant: Participant }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: participant.id,
        data: participant
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`bg-white dark:bg-gray-800 border p-3 rounded-lg flex items-center justify-between mb-2 shadow-sm ${isDragging ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                </button>
                <div>
                    <p className="font-bold text-sm dark:text-white truncate max-w-[150px]">{participant.first_name} {participant.last_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 ${participant.gender === 'male' ? 'bg-blue-100 text-blue-700' : participant.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>
                            {participant.gender === 'male' ? 'H' : participant.gender === 'female' ? 'M' : 'N/A'}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 ${participant.type === 'main' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                            {participant.type === 'main' ? 'Titular' : 'Grupo'}
                        </span>
                    </div>
                </div>
            </div>
            {participant.medical_cleared && (
                <div title="Expediente médico listo">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
            )}
        </div>
    );
}

// --- Droppable Container (Cabin or Unassigned Area) ---
function DroppableContainer({ id, title, participants, cabin }: { id: string | number; title: string; participants: Participant[]; cabin?: any }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex flex-col h-[500px] border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    {cabin ? (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cabin.gender === 'male' ? 'bg-blue-100 text-blue-600' : cabin.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Home className="w-4 h-4" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
                            <UserIcon className="w-4 h-4" />
                        </div>
                    )}
                    <h3 className="font-bold text-sm lg:text-base dark:text-white">{title}</h3>
                </div>
                <div className="text-xs font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                    {participants.length} {cabin ? `/ ${cabin.capacity}` : ''}
                </div>
            </div>
            
            <SortableContext id={id.toString()} items={participants.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto pr-1 pb-4">
                    {participants.map(p => (
                        <SortableParticipant key={p.id} participant={p} />
                    ))}
                    {participants.length === 0 && (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Arrastra participantes aquí
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// --- Main Component ---
export default function CabinAssigner() {
    const [camps, setCamps] = useState<any[]>([]);
    const [cabins, setCabins] = useState<any[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Drag state
    const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);

    const { showToast } = useToast();
    const navigate = useNavigate();
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        loadCamps();
    }, []);

    useEffect(() => {
        if (selectedCampId) {
            loadCampData(selectedCampId);
        }
    }, [selectedCampId]);

    const loadCamps = async () => {
        try {
            const data = await supabaseApi.camps.getAll();
            setCamps(data);
            if (data.length > 0) setSelectedCampId(data[0].id);
        } catch (error) {
            console.error(error);
        }
    };

    const loadCampData = async (campId: number) => {
        setLoading(true);
        try {
            const [cabinsData, regsResponse, memsResponse] = await Promise.all([
                supabaseApi.cabins.getAll(), // Will be filtered next line
                supabase.from('registrations').select('*').eq('camp_id', campId),
                // Since members don't have camp_id, we fetch all and filter by reg_id locally
                supabase.from('group_members').select('*')
            ]);
            
            const campCabins = cabinsData.filter((c: any) => c.camp_id === campId);
            setCabins(campCabins);

            const regs = regsResponse.data || [];
            const mems = memsResponse.data || [];
            
            const regIds = new Set(regs.map(r => r.id));
            const campMems = mems.filter(m => regIds.has(m.registration_id));

            const parsedParticipants: Participant[] = [];
            
            regs.forEach(r => {
                parsedParticipants.push({
                    id: `reg-${r.id}`,
                    db_id: r.id,
                    type: 'main',
                    first_name: r.responsable_name,
                    last_name: r.responsable_lastname,
                    gender: r.gender || 'unknown',
                    cabin_id: r.cabin_id,
                    camp_id: r.camp_id,
                    medical_cleared: r.medical_cleared
                });
            });

            campMems.forEach(m => {
                parsedParticipants.push({
                    id: `mem-${m.id}`,
                    db_id: m.id,
                    type: 'member',
                    first_name: m.first_name,
                    last_name: m.last_name,
                    gender: m.gender || 'unknown',
                    cabin_id: m.cabin_id,
                    camp_id: campId,
                    medical_cleared: m.medical_cleared
                });
            });

            setParticipants(parsedParticipants);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar participantes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const participant = participants.find(p => p.id === active.id);
        if (participant) setActiveParticipant(participant);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Ensure we are dropping into a different list
        // `over.data.current?.sortable.containerId` or `over.id` if dropping on empty container
        const activeParticipant = participants.find(p => p.id === activeId);
        if (!activeParticipant) return;

        let overContainerId = '';
        if (cabins.map(c => c.id.toString()).includes(overId.toString()) || overId === 'unassigned') {
            overContainerId = overId.toString();
        } else {
            // we dropped on another participant
            const overParticipant = participants.find(p => p.id === overId);
            if (overParticipant) {
                overContainerId = overParticipant.cabin_id ? overParticipant.cabin_id.toString() : 'unassigned';
            }
        }

        const activeContainerId = activeParticipant.cabin_id ? activeParticipant.cabin_id.toString() : 'unassigned';

        if (activeContainerId !== overContainerId) {
            // Move arrays visually without blocking here, otherwise hovering past an invalid cabin blocks UI
            setParticipants(prev => {
                const updated = [...prev];
                const index = updated.findIndex(p => p.id === activeId);
                if (index !== -1) {
                    updated[index] = { ...updated[index], cabin_id: overContainerId === 'unassigned' ? null : parseInt(overContainerId) };
                }
                return updated;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveParticipant(null);
        if (!over) return;

        // Perform the API call to save the new cabin_id
        const participant = participants.find(p => p.id === active.id);
        if (!participant) return;

        // Perform final gender validation before saving
        if (participant.cabin_id) {
            const targetCabin = cabins.find(c => c.id === participant.cabin_id);
            if (targetCabin && targetCabin.gender !== 'mixed') {
                if (participant.gender !== targetCabin.gender) {
                    showToast(`No puedes asignar a un participante ${participant.gender === 'male' ? 'Hombre' : 'Mujer'} en una cabaña de ${targetCabin.gender === 'male' ? 'Hombres' : 'Mujeres'}.`, 'error');
                    
                    // Revert visual state
                    setParticipants(prev => {
                        const updated = [...prev];
                        const index = updated.findIndex(p => p.id === active.id);
                        if (index !== -1) {
                            // Find their original cabin id (we don't easily have it unless we query DB, but we can just reload or set to unassigned)
                            // Better: reload camp data to ensure consistency
                            loadCampData(selectedCampId!);
                        }
                        return updated;
                    });
                    return;
                }
            }
        }

        setSaving(true);
        try {
            const table = participant.type === 'main' ? 'registrations' : 'group_members';
            await supabase.from(table).update({ cabin_id: participant.cabin_id }).eq('id', participant.db_id);
            // Suppress success toast to avoid spam when assigning many
        } catch (error) {
            console.error(error);
            showToast("Error al guardar asignación en la base de datos", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !participants.length) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    // Group participants for the columns
    const unassigned = participants.filter(p => p.cabin_id === null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/reservaciones')} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white tracking-tight flex items-center gap-3">Asignación Visual (Drag & Drop)</h1>
                        <p className="text-gray-500 text-sm mt-1">Arrastra a los acampantes a sus respectivas cabañas.</p>
                    </div>
                </div>
                {saving && <div className="flex items-center gap-2 text-sm text-primary font-bold bg-primary/10 px-4 py-2 rounded-lg animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</div>}
            </header>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex gap-4 overflow-x-auto shadow-sm">
                {camps.map(camp => (
                    <button
                        key={camp.id}
                        onClick={() => setSelectedCampId(camp.id)}
                        className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCampId === camp.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        {camp.title}
                    </button>
                ))}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Unassigned Column */}
                    <div className="lg:col-span-1">
                        <DroppableContainer id="unassigned" title="Sin Asignar" participants={unassigned} />
                    </div>

                    {/* Cabins Columns */}
                    <div className="lg:col-span-3">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {cabins.map(cabin => {
                                const cabinParticipants = participants.filter(p => p.cabin_id === cabin.id);
                                return (
                                    <DroppableContainer 
                                        key={cabin.id} 
                                        id={cabin.id} 
                                        title={cabin.name} 
                                        participants={cabinParticipants} 
                                        cabin={cabin} 
                                    />
                                );
                            })}
                            {cabins.length === 0 && (
                                <div className="col-span-full py-20 text-center text-gray-400 border border-dashed rounded-3xl border-gray-300 dark:border-gray-700">
                                    <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay cabañas creadas en este campamento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeParticipant ? (
                        <div className="bg-white dark:bg-gray-800 border-2 border-primary shadow-2xl rounded-lg p-3 flex items-center justify-between opacity-90 scale-105 rotate-3 cursor-grabbing">
                            <div className="flex items-center gap-3">
                                <GripVertical className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="font-bold text-sm dark:text-white">{activeParticipant.first_name} {activeParticipant.last_name}</p>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 bg-gray-100 mt-0.5 inline-block`}>
                                        {activeParticipant.gender === 'male' ? 'H' : activeParticipant.gender === 'female' ? 'M' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
