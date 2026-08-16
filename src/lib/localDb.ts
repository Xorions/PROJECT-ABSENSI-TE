type Table = "members" | "attendance" | "points";
type Row = Record<string, unknown>;

export const STORAGE_KEY = "staff-of-the-month-local-db";

type QueryResult = {
  data: Row | Row[] | null;
  error: Error | null;
};

const seed: Record<Table, Row[]> = {
  members: [
    {
      id: "TE-00000",
      name: "Ashilah Tsabitah Fitr",
      phone: null,
      organization: "Staff of The Month",
      role: "Panitia",
      joined_at: new Date().toISOString(),
    },
    {
      id: "STM-002",
      name: "Siti Aminah",
      phone: null,
      organization: "Staff of The Month",
      role: "Anggota",
      joined_at: new Date().toISOString(),
    },
    {
      id: "STM-003",
      name: "Andi Wijaya",
      phone: null,
      organization: "Staff of The Month",
      role: "Anggota",
      joined_at: new Date().toISOString(),
    },
  ],
  attendance: [],
  points: [],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadData(): Record<Table, Row[]> {
  if (typeof window === "undefined") return clone(seed);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(seed);
    const parsed = JSON.parse(raw) as Partial<Record<Table, Row[]>>;
    return { ...clone(seed), ...parsed };
  } catch {
    return clone(seed);
  }
}

let dbData = loadData();

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
  } catch {
    // abaikan error penyimpanan
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function pick(obj: Row, cols: string): Row {
  if (cols === "*") return { ...obj };
  const out: Row = {};
  for (const col of cols.split(",").map((c) => c.trim()).filter(Boolean)) {
    out[col] = obj[col];
  }
  return out;
}

function project(row: Row, columns: string): Row {
  if (columns === "*") {
    return { ...row };
  }

  const out: Row = {};
  for (const part of columns.split(",").map((p) => p.trim()).filter(Boolean)) {
    const join = part.match(/^(\w+):(\w+)\(([\w,\s]*)\)$/);
    if (join) {
      const alias = join[1];
      const joinTable = join[2] as Table;
      const joinCols = join[3];
      const target = dbData[joinTable].find((t) => t.id === row.member_id);
      out[alias] = target ? pick(target, joinCols) : null;
    } else {
      out[part] = row[part];
    }
  }
  return out;
}

class QueryBuilder implements PromiseLike<QueryResult> {
  private table: Table;
  private columns: string;
  private rows: Row[];

  constructor(table: Table, columns: string) {
    this.table = table;
    this.columns = columns;
    this.rows = dbData[table].map((row) => ({ ...row }));
  }

  eq(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[column] === value);
    return this;
  }

  ilike(column: string, value: string) {
    const needle = String(value).toLowerCase();
    this.rows = this.rows.filter((row) =>
      String(row[column] ?? "").toLowerCase().includes(needle)
    );
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const ascending = opts?.ascending ?? true;
    this.rows = [...this.rows].sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      const diff =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return ascending ? diff : -diff;
    });
    return this;
  }

  maybeSingle(): Promise<QueryResult> {
    const first = this.rows[0] ?? null;
    return Promise.resolve({
      data: first ? project(first, this.columns) : null,
      error: null,
    });
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const data = this.rows.map((row) => project(row, this.columns));
    return Promise.resolve<QueryResult>({ data, error: null }).then(
      onfulfilled,
      onrejected
    );
  }
}

class UpdateBuilder implements PromiseLike<QueryResult> {
  private table: Table;
  private values: Row;
  private conditions: Array<[string, unknown]> = [];

  constructor(table: Table, values: Row) {
    this.table = table;
    this.values = values;
  }

  eq(column: string, value: unknown) {
    this.conditions.push([column, value]);
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const matches = (row: Row) =>
      this.conditions.every(([col, val]) => row[col] === val);
    dbData[this.table] = dbData[this.table].map((row) =>
      matches(row) ? { ...row, ...this.values } : row
    );
    persist();
    return Promise.resolve<QueryResult>({ data: null, error: null }).then(
      onfulfilled,
      onrejected
    );
  }
}

class DeleteBuilder implements PromiseLike<QueryResult> {
  private table: Table;
  private conditions: Array<[string, unknown]> = [];

  constructor(table: Table) {
    this.table = table;
  }

  eq(column: string, value: unknown) {
    this.conditions.push([column, value]);
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const matches = (row: Row) =>
      this.conditions.every(([col, val]) => row[col] === val);
    dbData[this.table] = dbData[this.table].filter((row) => !matches(row));
    persist();
    return Promise.resolve<QueryResult>({ data: null, error: null }).then(
      onfulfilled,
      onrejected
    );
  }
}

function insert(table: Table, row: Row): Promise<QueryResult> {
  const stored: Row = {
    id: newId(),
    created_at: new Date().toISOString(),
    ...row,
  };
  dbData[table].push(stored);
  persist();
  return Promise.resolve({ data: [stored], error: null });
}

function upsert(table: Table, row: Row): Promise<QueryResult> {
  const key = row.id as string | undefined;
  if (key) {
    const idx = dbData[table].findIndex((r) => r.id === key);
    if (idx >= 0) {
      const stored: Row = { ...dbData[table][idx], ...row };
      dbData[table][idx] = stored;
      persist();
      return Promise.resolve({ data: [stored], error: null });
    }
  }
  return insert(table, row);
}

export function createLocalClient() {
  return {
    from(table: string) {
      return {
        select(columns?: string) {
          return new QueryBuilder(table as Table, columns ?? "*");
        },
        insert(row: Row) {
          return insert(table as Table, row);
        },
        upsert(row: Row) {
          return upsert(table as Table, row);
        },
        update(values: Row) {
          return new UpdateBuilder(table as Table, values);
        },
        delete() {
          return new DeleteBuilder(table as Table);
        },
      };
    },
  };
}
