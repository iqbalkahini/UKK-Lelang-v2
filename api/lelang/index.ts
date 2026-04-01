"use server";

import { createClient } from "@/lib/supabase/server";

export type Lelang = {
  id: number;
  barang_id: number;
  tgl_lelang: string;
  waktu_mulai: string;
  waktu_selesai: string;
  harga_akhir: number | null;
  status: "dibuka" | "ditutup" | "pending" | "dibayar";
  user_id: string;
  created_at?: string;
  is_manual: boolean;
  // Joined fields from barang
  barang?: {
    nama: string;
    harga_awal: number;
    deskripsi_barang: string;
    image_urls: string[] | null;
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
  petugas_id: string; // The UUID from tb_petugas
  status: "dibuka" | "ditutup" | "pending" | "dibayar";
  is_manual: boolean;
};

export type UpdateLelangInput = {
  barang_id?: number;
  tgl_lelang?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  status?: "dibuka" | "ditutup" | "pending" | "dibayar";
  harga_akhir?: number | null;
  is_manual?: boolean;
};

const assertLelangNotPaid = async (id: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tb_lelang")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (data?.status === "dibayar") {
    throw new Error(
      "Lelang ini sudah dibayar, sehingga tidak bisa diedit, dihapus, atau dibuka kembali.",
    );
  }
};

export const getLelang = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  statusFilter: string | string[] = "all",
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
          deskripsi_barang,
          image_urls
        )
      `,
      )
      .order("tgl_lelang", { ascending: date === "ascending" });

    // Apply status filter
    if (statusFilter !== "all") {
      if (Array.isArray(statusFilter)) {
        countQuery = countQuery.in("status", statusFilter);
        dataQuery = dataQuery.in("status", statusFilter);
      } else {
        countQuery = countQuery.eq("status", statusFilter);
        dataQuery = dataQuery.eq("status", statusFilter);
      }
    }

    // Apply search filter
    // if (search && search.trim() !== "") {
    //   const searchTerm = `%${search.trim()}%`;
    //   // Search in barang nama through join
    //   countQuery = countQuery.or(
    //     `barang_id.in.(select id from tb_barang where nama ilike '${searchTerm}')`,
    //   );
    //   dataQuery = dataQuery.select("*, tb_barang!inner(nama)").ilike("tb_barang.nama", `%${search.trim()}%`);
    // }

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;

      // Count query dengan join
      countQuery = supabase
        .from("tb_lelang")
        .select("id, tb_barang!inner(nama)", { count: "exact", head: true })
        .ilike("tb_barang.nama", searchTerm);

      // Data query dengan join
      dataQuery = dataQuery
        .select(
          `
      *,
      barang:tb_barang!inner (
        nama,
        harga_awal,
        deskripsi_barang,
        image_urls
      )
    `,
        )
        .ilike("tb_barang.nama", searchTerm);
    }


    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("Error fetching lelang count:", countError);
      return { data: [], total: 0, totalPages: 0, currentPage: page, limit };
    }

    const { data, error } = await dataQuery.range(offset, offset + limit - 1);
    if (error) {
      console.error("Error fetching lelang data:", error);
      return { data: [], total: 0, totalPages: 0, currentPage: page, limit };
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as Lelang[]) ?? [],
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Critical error in getLelang:", error);
    return { data: [], total: 0, totalPages: 0, currentPage: 1, limit: 10 };
  }
};

export const getLelangById = async (id: number): Promise<Lelang | null> => {
  try {
    if (isNaN(id)) return null;
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .select(
        `
        *,
        barang:tb_barang!barang_id (
          nama,
          harga_awal,
          deskripsi_barang,
          image_urls
        )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching lelang by id:", error);
      return null;
    }
    
    return data as Lelang;
  } catch (error) {
    console.error("Critical error in getLelangById:", error);
    return null;
  }
};

export const createLelang = async (
  input: CreateLelangInput,
): Promise<Lelang> => {
  try {
    const supabase = await createClient();

    // 2. Look up petugas profile to get the bigint ID
    const { data: petugas, error: petugasError } = await supabase
      .from("tb_petugas")
      .select("id")
      .eq("user_id", input.petugas_id)
      .single();

    if (petugasError || !petugas) {
      console.error("Petugas profile not found for UUID:", input.petugas_id);
      throw new Error("Profil petugas tidak ditemukan");
    }

    // 3. Prepare payload
    const payload = {
      barang_id: input.barang_id,
      tgl_lelang: input.tgl_lelang,
      waktu_mulai: input.waktu_mulai,
      waktu_selesai: input.waktu_selesai,
      harga_akhir: input.harga_akhir,
      status: input.status,
      petugas_id: petugas.id, // Use the bigint ID from tb_petugas
      is_manual: input.is_manual,
      user_id: null,
    };

    const { data, error } = await supabase
      .from("tb_lelang")
      .insert([payload])
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
    await assertLelangNotPaid(id);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .update(input)
      .eq("id", id)
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
  status: "dibuka" | "ditutup" | "pending" | "dibayar",
  harga_akhir?: number,
): Promise<Lelang> => {
  try {
    await assertLelangNotPaid(id);

    const supabase = await createClient();

    const updateData: UpdateLelangInput = { status };
    if (harga_akhir !== undefined) {
      updateData.harga_akhir = harga_akhir;
    }

    const { data, error } = await supabase
      .from("tb_lelang")
      .update(updateData)
      .eq("id", id)
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
    await assertLelangNotPaid(id);

    const supabase = await createClient();
    const { error } = await supabase
      .from("tb_lelang")
      .delete()
      .eq("id", id);

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
      .from("history_lelang")
      .select("penawaran_harga")
      .eq("id_lelang", id_lelang)
      .order("penawaran_harga", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No bids found
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data?.penawaran_harga ?? null;
  } catch (error) {
    console.error("Error getting highest bid:", error);
    return null;
  }
};

// Get Active Auctions for Masyarakat Catalog
export const getActiveAuctions = async (): Promise<Lelang[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tb_lelang')
      .select(`
            *,
            barang:tb_barang(*)
        `)
      .eq('status', 'dibuka')
      .order('tgl_lelang', { ascending: false });

    if (error) throw error;
    return data as Lelang[];
  } catch (error) {
    console.error("Error fetching active auctions:", error);
    return [];
  }
};

// Get IDs of items already in tb_lelang
export const getLelangBarangIds = async (): Promise<number[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_lelang")
      .select("barang_id");

    if (error) throw error;
    return data.map((item) => item.barang_id);
  } catch (error) {
    console.error("Error fetching lelang barang ids:", error);
    return [];
  }
};
