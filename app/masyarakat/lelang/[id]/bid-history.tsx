"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gavel, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bid {
    id: number;
    penawaran_harga: number;
    created_at: string;
    masyarakat: {
        nama_lengkap: string;
    };
}

export function BidHistory({ lelangId }: { lelangId: number }) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();

        // 1. Initial Fetch
        const fetchBids = async () => {
            const { data } = await supabase
                .from('history_lelang')
                .select(`
                    id, 
                    penawaran_harga, 
                    created_at,
                    masyarakat:tb_masyarakat(nama_lengkap)
                `)
                .eq('lelang_id', lelangId)
                .order('penawaran_harga', { ascending: false });
            
            if (data) setBids(data as any);
        };

        fetchBids();

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`bid-history-${lelangId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'history_lelang',
                    filter: `lelang_id=eq.${lelangId}`
                },
                (payload: any) => {
                    // Refetch to get the joined data (masyarakat name)
                    fetchBids();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [lelangId]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (windowRef.current) {
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (!isVisible) return (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100 }}>
             <button 
                className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 font-semibold text-xs"
                onClick={() => setIsVisible(true)}
            >
                <Gavel className="h-4 w-4" />
                Daftar Penawar
            </button>
        </div>
    );

    return (
        <div 
            ref={windowRef}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                zIndex: 100,
                resize: 'both',
                overflow: 'hidden'
            }}
            className="fixed w-80 min-h-[160px] min-w-[200px] h-[300px] flex flex-col pointer-events-auto"
        >
            <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm flex flex-col h-full overflow-hidden">
                <CardHeader 
                    className="p-3 bg-primary text-primary-foreground flex flex-row items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-2 pointer-events-none">
                        <GripVertical className="h-4 w-4 opacity-50" />
                        <CardTitle className="text-sm font-bold flex items-center gap-1">
                            <Gavel className="h-4 w-4" />
                            Daftar Penawar
                        </CardTitle>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="hover:bg-primary-foreground/20 p-1 rounded transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1">
                    {bids.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm italic">
                            Belum ada penawaran.
                        </div>
                    ) : (
                        <div className="divide-y divide-muted">
                            {bids.map((bid, idx) => (
                                <div 
                                    key={bid.id} 
                                    className={cn(
                                        "p-3 flex justify-between items-center transition-colors",
                                        idx === 0 ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {bid.masyarakat?.nama_lengkap}
                                        </span>
                                        <span className={cn(
                                            "text-sm",
                                            idx === 0 ? "text-primary font-bold" : "text-foreground"
                                        )}>
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0
                                            }).format(bid.penawaran_harga)}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground text-right whitespace-nowrap ml-2">
                                        {new Date(bid.created_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
