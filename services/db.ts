import { PGlite } from "@electric-sql/pglite";
import { JournalPost, Circular, User, MenuItem, OrgEvent, SearchResult, Holiday, ArchiveStat, QuickLinkCategory, QuickLink } from '../types';
import { MOCK_JOURNAL, MOCK_CIRCULARS, MOCK_HOLIDAYS, MOCK_LINKS } from './mockData';

class DatabaseService {
  private db: PGlite | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.getDB();
  }

  private async getDB() {
    if (this.db) return this.db;
    if (!this.initPromise) {
      this.initPromise = this.initializeDatabase();
    }
    await this.initPromise;
    return this.db!;
  }

  private async initializeDatabase() {
    try {
      this.db = new PGlite();
      console.log('Initializing Postgres Database...');

      await this.db.exec(`
        -- Users
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          role TEXT DEFAULT 'admin',
          avatar_url TEXT,
          department TEXT,
          designation TEXT,
          phone TEXT,
          bio TEXT
        );

        -- Journal Posts (News, Updates)
        CREATE TABLE IF NOT EXISTS journal_posts (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          excerpt TEXT,
          content TEXT,
          priority BOOLEAN DEFAULT FALSE,
          category TEXT NOT NULL,
          published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          attachment_url TEXT
        );

        -- Circulars (OMs)
        CREATE TABLE IF NOT EXISTS circulars (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          summary TEXT,
          ref_number TEXT,
          issue_date DATE NOT NULL,
          is_archived BOOLEAN DEFAULT FALSE,
          category TEXT NOT NULL,
          attachment_url TEXT
        );

        -- Organizational Events
        CREATE TABLE IF NOT EXISTS org_events (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          date TIMESTAMP NOT NULL,
          location TEXT,
          description TEXT,
          type TEXT DEFAULT 'meeting'
        );

        -- Holidays
        CREATE TABLE IF NOT EXISTS holidays (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          date DATE NOT NULL,
          type TEXT NOT NULL,
          is_tentative BOOLEAN DEFAULT FALSE,
          notes TEXT,
          color_hex TEXT DEFAULT '#ef4444'
        );

        -- Menus (Dynamic Navigation)
        CREATE TABLE IF NOT EXISTS menus (
          id SERIAL PRIMARY KEY,
          label TEXT NOT NULL,
          route TEXT NOT NULL,
          type TEXT DEFAULT 'internal',
          order_index INTEGER DEFAULT 0
        );

        -- Link Categories (Blocks on Right Sidebar)
        CREATE TABLE IF NOT EXISTS link_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          order_index INTEGER DEFAULT 0
        );

        -- Quick Links
        CREATE TABLE IF NOT EXISTS quick_links (
          id SERIAL PRIMARY KEY,
          category_id INTEGER,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          is_external BOOLEAN DEFAULT TRUE,
          order_index INTEGER DEFAULT 0
        );
      `);

      // Seeding
      await this.seedUsers();
      await this.seedContent();
      await this.seedMenus();
      await this.seedHolidays();
      await this.seedLinks();

    } catch (err) {
      console.error('Failed to initialize database:', err);
    }
  }

  private async seedUsers() {
    const adminCheck = await this.db!.query("SELECT 1 FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
      await this.db!.query(`
        INSERT INTO users (username, password, full_name, role, avatar_url, department, designation, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
          'admin', 
          'admin123', 
          'System Administrator', 
          'admin', 
          'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
          'Computer Centre',
          'Senior Technical Officer',
          'Responsible for maintaining the intranet infrastructure and user access.'
      ]);
    }
  }

  private async seedContent() {
    const journalCheck = await this.db!.query("SELECT 1 FROM journal_posts LIMIT 1");
    if (journalCheck.rows.length === 0) {
      for (const post of MOCK_JOURNAL) {
        await this.createJournalPost(post as any, true);
      }
    }
    const circularCheck = await this.db!.query("SELECT 1 FROM circulars LIMIT 1");
    if (circularCheck.rows.length === 0) {
      for (const circ of MOCK_CIRCULARS) {
        await this.createCircular(circ as any, true);
      }
    }
    
    // Seed Events
    const eventsCheck = await this.db!.query("SELECT 1 FROM org_events LIMIT 1");
    if (eventsCheck.rows.length === 0) {
      await this.db!.query(`
        INSERT INTO org_events (title, date, location, description, type) VALUES 
        ('Annual Science Conference', '2024-10-15 09:00:00', 'Auditorium', 'Gathering of all scientific staff.', 'conference'),
        ('Safety Committee Meeting', '2024-10-20 14:00:00', 'Conf Room A', 'Quarterly safety review.', 'meeting')
      `);
    }
  }

  private async seedMenus() {
    const menuCheck = await this.db!.query("SELECT 1 FROM menus LIMIT 1");
    if (menuCheck.rows.length === 0) {
      await this.db!.query(`
        INSERT INTO menus (label, route, type, order_index) VALUES
        ('Dashboard', 'home', 'internal', 1),
        ('Calendar', 'calendar', 'internal', 2),
        ('Gallery', 'gallery', 'internal', 3),
        ('About', 'about', 'page', 4),
        ('CSIR Main', 'https://www.csir.res.in', 'external', 5)
      `);
    }
  }

  private async seedHolidays() {
     const holCheck = await this.db!.query("SELECT 1 FROM holidays LIMIT 1");
     if (holCheck.rows.length === 0) {
        for (const h of MOCK_HOLIDAYS) {
            await this.db!.query(`
                INSERT INTO holidays (name, date, type, is_tentative, notes, color_hex)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [h.name, h.date, h.holidayType, h.isTentative, h.notes || '', h.colourHex]);
        }
     }
  }

  private async seedLinks() {
      const catCheck = await this.db!.query("SELECT 1 FROM link_categories LIMIT 1");
      if (catCheck.rows.length === 0) {
          // Use MOCK_LINKS to seed
          for (let i = 0; i < MOCK_LINKS.length; i++) {
              const cat = MOCK_LINKS[i];
              const res = await this.db!.query(`
                INSERT INTO link_categories (name, order_index) VALUES ($1, $2) RETURNING id
              `, [cat.name, i]);
              const catId = (res.rows[0] as any).id;
              
              for (const link of cat.links) {
                  await this.db!.query(`
                    INSERT INTO quick_links (category_id, title, url, is_external, order_index)
                    VALUES ($1, $2, $3, $4, 0)
                  `, [catId, link.title, link.url, link.isExternal]);
              }
          }
      }
  }

  // --- Auth & User Management ---
  async loginAdmin(username: string, password: string): Promise<User | null> {
    const db = await this.getDB();
    const res = await db.query(`
      SELECT id, username, full_name as name, role, avatar_url as "avatarUrl", department, designation, bio, phone
      FROM users WHERE username = $1 AND password = $2
    `, [username, password]);

    if (res.rows.length > 0) {
      const row = res.rows[0] as any;
      return {
        id: row.id.toString(),
        name: row.name,
        email: `${row.username}@csir.res.in`,
        role: row.role as 'admin',
        avatarUrl: row.avatarUrl,
        department: row.department,
        designation: row.designation,
        bio: row.bio,
        phone: row.phone
      };
    }
    return null;
  }

  async updateUser(user: User): Promise<void> {
    const db = await this.getDB();
    await db.query(`
      UPDATE users 
      SET full_name = $1, department = $2, designation = $3, bio = $4, phone = $5, avatar_url = $6
      WHERE id = $7
    `, [user.name, user.department, user.designation, user.bio, user.phone, user.avatarUrl, user.id]);
  }

  // --- Search Engine ---
  async searchContent(query: string): Promise<SearchResult[]> {
    const db = await this.getDB();
    const term = `%${query}%`;
    const results: SearchResult[] = [];

    // Search Journals
    const journals = await db.query(`
        SELECT id, title, excerpt as snippet, published_at as date 
        FROM journal_posts 
        WHERE title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1
        LIMIT 5
    `, [term]);
    journals.rows.forEach((r: any) => results.push({
        id: r.id, type: 'journal', title: r.title, snippet: r.snippet, date: r.date, url: '#'
    }));

    // Search Circulars
    const circulars = await db.query(`
        SELECT id, title, summary as snippet, issue_date as date 
        FROM circulars 
        WHERE title ILIKE $1 OR summary ILIKE $1 OR ref_number ILIKE $1
        LIMIT 5
    `, [term]);
    circulars.rows.forEach((r: any) => results.push({
        id: r.id, type: 'circular', title: r.title, snippet: r.snippet, date: r.date, url: '#'
    }));

    return results;
  }

  // --- Menus ---
  async getMenuItems(): Promise<MenuItem[]> {
    const db = await this.getDB();
    const res = await db.query(`SELECT id, label, route, type, order_index as "order" FROM menus ORDER BY order_index ASC`);
    return res.rows as MenuItem[];
  }

  // --- Events & Holidays ---
  async getHolidays(): Promise<Holiday[]> {
    const db = await this.getDB();
    const res = await db.query(`SELECT id, name, date, type as "holidayType", is_tentative as "isTentative", notes, color_hex as "colourHex" FROM holidays ORDER BY date ASC`);
    return res.rows.map((r: any) => ({ ...r, date: new Date(r.date).toISOString() }));
  }

  async importHolidaysCSV(csvText: string): Promise<void> {
    const db = await this.getDB();
    const lines = csvText.split('\n');
    await db.query('BEGIN');
    try {
        for (let i = 1; i < lines.length; i++) { 
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(',');
            if (cols.length >= 3) {
                const name = cols[0].trim();
                const date = cols[1].trim();
                const type = cols[2].trim().toLowerCase();
                const notes = cols[3] ? cols[3].trim() : '';
                const color = type === 'gazetted' ? '#ef4444' : '#eab308';
                
                await db.query(`
                    INSERT INTO holidays (name, date, type, notes, color_hex)
                    VALUES ($1, $2, $3, $4, $5)
                `, [name, date, type, notes, color]);
            }
        }
        await db.query('COMMIT');
    } catch (e) {
        await db.query('ROLLBACK');
        throw e;
    }
  }

  async getOrgEvents(): Promise<OrgEvent[]> {
    const db = await this.getDB();
    const res = await db.query(`SELECT * FROM org_events ORDER BY date ASC`);
    return res.rows.map((r: any) => ({ ...r, date: new Date(r.date).toISOString() }));
  }

  // --- Archives ---
  async getArchiveYears(): Promise<ArchiveStat[]> {
    const db = await this.getDB();
    const res = await db.query(`
      SELECT extract(year from published_at) as year, count(*) as count 
      FROM journal_posts 
      GROUP BY year 
      UNION ALL
      SELECT extract(year from issue_date) as year, count(*) as count
      FROM circulars
      GROUP BY year
    `);
    
    const yearMap: Record<number, number> = {};
    res.rows.forEach((r: any) => {
        const y = parseInt(r.year);
        const c = parseInt(r.count);
        if(!yearMap[y]) yearMap[y] = 0;
        yearMap[y] += c;
    });

    return Object.entries(yearMap)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => b.year - a.year);
  }

  // --- Quick Links & Categories ---
  async getQuickLinkCategories(): Promise<QuickLinkCategory[]> {
      const db = await this.getDB();
      // Fetch categories
      const catRes = await db.query(`SELECT id, name, order_index as "orderIndex" FROM link_categories ORDER BY order_index ASC`);
      const categories: QuickLinkCategory[] = catRes.rows.map((r: any) => ({...r, links: []}));
      
      // Fetch all links
      const linkRes = await db.query(`SELECT id, category_id as "categoryId", title, url, is_external as "isExternal" FROM quick_links ORDER BY order_index ASC`);
      
      // Map links to categories
      linkRes.rows.forEach((link: any) => {
          const cat = categories.find(c => c.id === link.categoryId);
          if (cat) {
              cat.links.push(link);
          }
      });
      
      return categories;
  }

  async createLinkCategory(name: string): Promise<void> {
      const db = await this.getDB();
      const countRes = await db.query(`SELECT count(*) as c FROM link_categories`);
      const order = parseInt((countRes.rows[0] as any).c);
      await db.query(`INSERT INTO link_categories (name, order_index) VALUES ($1, $2)`, [name, order]);
  }

  async deleteLinkCategory(id: number): Promise<void> {
      const db = await this.getDB();
      await db.query(`DELETE FROM quick_links WHERE category_id = $1`, [id]);
      await db.query(`DELETE FROM link_categories WHERE id = $1`, [id]);
  }

  async createQuickLink(categoryId: number, title: string, url: string, isExternal: boolean): Promise<void> {
      const db = await this.getDB();
      await db.query(`INSERT INTO quick_links (category_id, title, url, is_external) VALUES ($1, $2, $3, $4)`, [categoryId, title, url, isExternal]);
  }

  async deleteQuickLink(id: number): Promise<void> {
      const db = await this.getDB();
      await db.query(`DELETE FROM quick_links WHERE id = $1`, [id]);
  }

  // --- CRUD (Journal/Circulars) ---
  async getJournalPosts(category?: string, year?: number): Promise<JournalPost[]> {
    const db = await this.getDB();
    let query = `SELECT id, title, slug, excerpt, content, priority, category, published_at as "publishedAt", attachment_url as "attachmentUrl" FROM journal_posts WHERE 1=1`;
    const params: any[] = [];
    
    if (category && category !== 'All') {
        params.push(category);
        query += ` AND category = $${params.length}`;
    }
    
    if (year) {
        params.push(year);
        query += ` AND extract(year from published_at) = $${params.length}`;
    }
    
    query += ` ORDER BY priority DESC, published_at DESC`;
    
    const res = await db.query(query, params);
    return res.rows.map((row: any) => ({
      ...row,
      publishedAt: new Date(row.publishedAt).toISOString()
    }));
  }

  async createJournalPost(post: Omit<JournalPost, 'id' | 'slug' | 'publishedAt'>, isSeed = false): Promise<JournalPost> {
    const db = await this.getDB();
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const publishedAt = isSeed && (post as any).publishedAt ? (post as any).publishedAt : new Date().toISOString();
    const attachmentUrl = post.attachmentUrl || null;
    const content = post.content || post.excerpt;

    const res = await db.query(`
      INSERT INTO journal_posts (title, slug, excerpt, content, priority, category, published_at, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, slug, excerpt, content, priority, category, published_at as "publishedAt", attachment_url as "attachmentUrl"
    `, [post.title, slug, post.excerpt, content, post.priority, post.category, publishedAt, attachmentUrl]);

    const row = res.rows[0] as any;
    return { ...row, publishedAt: new Date(row.publishedAt).toISOString() };
  }

  async deleteJournalPost(id: number): Promise<void> {
    const db = await this.getDB();
    await db.query('DELETE FROM journal_posts WHERE id = $1', [id]);
  }

  async getCirculars(category?: string, year?: number): Promise<Circular[]> {
    const db = await this.getDB();
    let query = `SELECT id, title, slug, summary, ref_number as "refNumber", issue_date as "issueDate", is_archived as "isArchived", category, attachment_url as "attachmentUrl" FROM circulars WHERE 1=1`;
    const params: any[] = [];
    
    if (category && category !== 'All') {
        params.push(category);
        query += ` AND category = $${params.length}`;
    }

    if (year) {
        params.push(year);
        query += ` AND extract(year from issue_date) = $${params.length}`;
    }

    query += ` ORDER BY issue_date DESC`;

    const res = await db.query(query, params);
    return res.rows.map((row: any) => ({
      ...row,
      issueDate: new Date(row.issueDate).toISOString()
    }));
  }

  async createCircular(circular: Omit<Circular, 'id' | 'slug'>, isSeed = false): Promise<Circular> {
    const db = await this.getDB();
    const slug = circular.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const attachmentUrl = circular.attachmentUrl || '#'; 
    
    const res = await db.query(`
      INSERT INTO circulars (title, slug, summary, ref_number, issue_date, is_archived, category, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, slug, summary, ref_number as "refNumber", issue_date as "issueDate", is_archived as "isArchived", category, attachment_url as "attachmentUrl"
    `, [circular.title, slug, circular.summary, circular.refNumber, circular.issueDate, false, circular.category, attachmentUrl]);

    const row = res.rows[0] as any;
    return { ...row, issueDate: new Date(row.issueDate).toISOString() };
  }
}

export const db = new DatabaseService();