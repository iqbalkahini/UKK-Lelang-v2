"use server";

import { createClient } from "@/lib/supabase/server";

export type Lelang = {
  id_lelang: number;
  id_barang: number;
  tgl_lelang: string;
  waktu_mulai: string;
  waktu_selesai: string;
  harga_akhir: number | null;
  status: "dibuka" | "ditutup" | "pending";
  user_id: string;
  created_at?: string;
  // Joined fields from barang
  barang?: {
    nama: string;
    harga_awal: number;
    deskripsi_barang: string;
  };
};

export type GetLelangResponse = {
  data: Lelang[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export type CreateLelangInput = {
  barang_id: number;
  tgl_lelang: string;
  waktu_mulai: string;
  waktu_selesai: string;
  harga_akhir: number;
  petugas_id: string;
  status: "dibuka" | "ditutup" | "pending";
  user_id: string;
};

export type UpdateLelangInput = {
  id_barang?: number;
  tgl_lelang?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  status?: "dibuka" | "ditutup" | "pending";
  harga_akhir?: number | null;
};

export const getLelang = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  statusFilter: string = "all",
  date: string = "descending",
): Promise<GetLelangResponse> => {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // Build query with join to tb_barang
    let countQuery = supabase
      .from("tb_lelang")
      .select("*", { count: "exact", head: true });

    let dataQuery = supabase
      .from("tb_lelang")
      .select(
        `
        *,
        barang:tb_barang!barang_id (
          nama,
          harga_awal,
          deskripsi_barang
        )
      `,
      )
      .order("tgl_lelang", { ascending: date === "ascending" });

    // Apply status filter
    if (statusFilter !== "all") {
      countQuery = countQuery.eq("status", statusFilter);
      dataQuery = dataQuery.eq("status", statusFilter);
    }

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      // Search in barang nama through join
      countQuery = countQuery.or(
        `barang_id.in.(select id from tb_barang where nama ilike '${searchTerm}')`,
      );
      dataQuery = dataQuery.or(
        `barang_id.in.(select id from tb_barang where nama ilike '${searchTerm}')`,
      );
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const { data, error } = await dataQuery.range(offset, offset + limit - 1);
    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Lelang[],
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching lelang:", error);
    throw error;
  }
};

export const getLelangById = async (id: number): Promise<Lelang> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .select(
        `
        *,
        barang:tb_barang!id_barang (
          nama,
          harga_awal,
          deskripsi_barang
        )
      `,
      )
      .eq("id_lelang", id)
      .single();

    if (error) throw error;
    return data as Lelang;
  } catch (error) {
    console.error("Error fetching lelang by id:", error);
    throw error;
  }
};

export const createLelang = async (
  input: CreateLelangInput,
): Promise<Lelang> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data as Lelang;
  } catch (error) {
    console.error("Error creating lelang:", error);
    throw error;
  }
};

export const updateLelang = async (
  id: number,
  input: UpdateLelangInput,
): Promise<Lelang> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .update(input)
      .eq("id_lelang", id)
      .select()
      .single();

    if (error) throw error;
    return data as Lelang;
  } catch (error) {
    console.error("Error updating lelang:", error);
    throw error;
  }
};

export const updateStatusLelang = async (
  id: number,
  status: "dibuka" | "ditutup" | "pending",
  harga_akhir?: number,
): Promise<Lelang> => {
  try {
    const supabase = await createClient();

    const updateData: any = { status };
    if (harga_akhir !== undefined) {
      updateData.harga_akhir = harga_akhir;
    }

    const { data, error } = await supabase
      .from("tb_lelang")
      .update(updateData)
      .eq("id_lelang", id)
      .select()
      .single();

    if (error) throw error;
    return data as Lelang;
  } catch (error) {
    console.error("Error updating lelang status:", error);
    throw error;
  }
};

export const deleteLelang = async (id: number): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tb_lelang")
      .delete()
      .eq("id_lelang", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting lelang:", error);
    throw error;
  }
};

// Get highest bid for a lelang (used when closing)
export const getHighestBid = async (
  id_lelang: number,
): Promise<number | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_penawaran")
      .select("harga_penawaran")
      .eq("id_lelang", id_lelang)
      .order("harga_penawaran", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No bids found
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data?.harga_penawaran ?? null;
  } catch (error) {
    console.error("Error getting highest bid:", error);
    return null;
  }
};
