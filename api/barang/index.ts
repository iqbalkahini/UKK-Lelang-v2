"use server";

import { createClient } from "@/lib/supabase/server";

export type Barang = {
  id: number;
  nama: string;
  tanggal: string;
  harga_awal: number;
  deskripsi_barang: string;
  image_urls: string[];
};

export type GetBarangResponse = {
  data: Barang[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export const getBarang = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  date: string = "descending",
): Promise<GetBarangResponse> => {
  try {
    const supabase = await createClient();

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query with optional search filter
    let countQuery = supabase
      .from("tb_barang")
      .select("*", { count: "exact", head: true });
    let dataQuery = supabase
      .from("tb_barang")
      .select("*")
      .order("tanggal", { ascending: date == "ascending" });

    // Apply search filter if search query exists
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      countQuery = countQuery.or(
        `nama.ilike.${searchTerm},deskripsi_barang.ilike.${searchTerm}`,
      );
      dataQuery = dataQuery.or(
        `nama.ilike.${searchTerm},deskripsi_barang.ilike.${searchTerm}`,
      );
    }

    // Get total count with search filter
    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // Get paginated data with search filter
    const { data, error } = await dataQuery.range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Barang[],
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching barang:", error);
    throw error;
  }
};

export const getBarangById = async (id: number) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tb_barang")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Barang;
  } catch (error) {
    console.error("Error fetching barang by id:", error);
    throw error;
  }
};

export const deleteBarang = async (id: number) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tb_barang").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting barang:", error);
    throw error;
  }
};

export const getBarangForSelect = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  excludeId?: number,
): Promise<GetBarangResponse> => {
  try {
    const supabase = await createClient();

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query with optional search filter
    let countQuery = supabase
      .from("tb_barang")
      .select("*", { count: "exact", head: true });
    let dataQuery = supabase
      .from("tb_barang")
      .select("*")
      .order("tanggal", { ascending: false });

    // Apply search filter if search query exists
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      countQuery = countQuery.or(
        `nama.ilike.${searchTerm},deskripsi_barang.ilike.${searchTerm}`,
      );
      dataQuery = dataQuery.or(
        `nama.ilike.${searchTerm},deskripsi_barang.ilike.${searchTerm}`,
      );
    }

    // Apply exclusion if excludeId is provided
    if (excludeId) {
      countQuery = countQuery.neq("id", excludeId);
      dataQuery = dataQuery.neq("id", excludeId);
    }

    // Get total count with search filter
    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // Get paginated data with search filter
    const { data, error } = await dataQuery.range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Barang[],
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching barang for select:", error);
    throw error;
  }
};
