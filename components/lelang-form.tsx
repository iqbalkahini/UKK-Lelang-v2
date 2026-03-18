"use client";

import { useState, useEffect } from "react";
import { getBarang, type Barang } from "@/api/barang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type LelangFormProps = {
  initialData?: {
    barang_id?: number;
    tgl_lelang?: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending";
    is_manual: boolean;
  };
  onSubmit: (data: {
    barang_id: number;
    tgl_lelang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending";
    is_manual: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function LelangForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Simpan",
}: LelangFormProps) {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [isLoadingBarang, setIsLoadingBarang] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  type LelangFormData = {
    id_barang: string;
    tgl_lelang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending";
    is_manual: boolean;
  };

  const [formData, setFormData] = useState<LelangFormData>({
    id_barang: initialData?.barang_id?.toString() || "",
    tgl_lelang: initialData?.tgl_lelang
      ? new Date(initialData.tgl_lelang).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    waktu_mulai: initialData?.waktu_mulai?.slice(0, 5) || "08:00",
    waktu_selesai: initialData?.waktu_selesai?.slice(0, 5) || "16:00",
    status:
      initialData?.status || ("pending" as "dibuka" | "ditutup" | "pending"),
    is_manual: initialData?.is_manual ?? true,
  });

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const result = await getBarang(1, 1000); // Get all barang
        setBarangList(result.data);
      } catch (error) {
        console.error("Error fetching barang:", error);
        toast.error("Gagal mengambil data barang");
      } finally {
        setIsLoadingBarang(false);
      }
    };

    fetchBarang();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.id_barang) {
      toast.error("Pilih barang terlebih dahulu");
      return;
    }

    if (!formData.tgl_lelang) {
      toast.error("Tanggal lelang harus diisi");
      return;
    }

    setIsSubmitting(true);
    const formatTimeForDB = (timeStr: string) => {
      // Ensure time is in HH:mm:ss format for database
      if (timeStr.length === 5) return `${timeStr}:00`;
      return timeStr;
    };

    try {
      await onSubmit({
        barang_id: parseInt(formData.id_barang),
        tgl_lelang: formData.tgl_lelang,
        waktu_mulai: formatTimeForDB(formData.waktu_mulai),
        waktu_selesai: formatTimeForDB(formData.waktu_selesai),
        status: formData.status,
        is_manual: formData.is_manual,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan data lelang");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barang Selection */}
      <div className="space-y-2">
        <Label htmlFor="id_barang">Barang</Label>
        {isLoadingBarang ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memuat data barang...
          </div>
        ) : (
          <Select
            value={formData.id_barang}
            onValueChange={(value) =>
              setFormData({ ...formData, id_barang: value })
            }
          >
            <SelectTrigger id="id_barang">
              <SelectValue placeholder="Pilih barang" />
            </SelectTrigger>
            <SelectContent>
              {barangList.map((barang) => (
                <SelectItem key={barang.id} value={barang.id.toString()}>
                  {barang.nama} - Rp {barang.harga_awal.toLocaleString("id-ID")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tanggal Lelang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tgl_lelang">Tanggal Lelang</Label>
          <Input
            id="tgl_lelang"
            type="date"
            value={formData.tgl_lelang}
            onChange={(e) =>
              setFormData({ ...formData, tgl_lelang: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
          <Input
            id="waktu_mulai"
            type="time"
            value={formData.waktu_mulai}
            onChange={(e) =>
              setFormData({ ...formData, waktu_mulai: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
          <Input
            id="waktu_selesai"
            type="time"
            value={formData.waktu_selesai}
            onChange={(e) =>
              setFormData({ ...formData, waktu_selesai: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "dibuka" | "ditutup" | "pending") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Tertunda</SelectItem>
            <SelectItem value="dibuka">Dibuka</SelectItem>
            <SelectItem value="ditutup">Ditutup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* is_manual */}
      <div className="space-y-2">
        <Label htmlFor="is_manual">Pengaturan Waktu</Label>
        <Select
          value={formData.is_manual.toString()}
          onValueChange={(value: "true" | "false") =>
            setFormData({ ...formData, is_manual: value === "true" })
          }
        >
          <SelectTrigger id="is_manual">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Manual</SelectItem>
            <SelectItem value="false">Otomatis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || isLoadingBarang}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
