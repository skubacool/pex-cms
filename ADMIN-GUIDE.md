# Power Express — Website Editing Guide (for everyone)

คู่มือแก้ไขเว็บไซต์ Power Express (สำหรับทุกคน — ไม่ต้องมีความรู้ด้านไอที)

You do **not** need any technical knowledge to update the website.
Everything is done in a normal web page with forms and buttons.

---

## 1. Logging in · เข้าสู่ระบบ

1. Open this address in your browser · เปิดลิงก์นี้ในเบราว์เซอร์:
   **https://skubacool.github.io/pex-cms/**
2. Type your **email** and **password** (given to you by the administrator).
   กรอก **อีเมล** และ **รหัสผ่าน** (ที่ได้รับจากผู้ดูแลระบบ)
3. Click **Sign in · เข้าสู่ระบบ**.

You now see the **Content Manager**. On the left is a menu:

| Menu item | What it controls · ใช้แก้อะไร |
| --- | --- |
| 🖼️ Hero Banners | The big rotating pictures at the top of the home page · แบนเนอร์ใหญ่หน้าแรก |
| ☀️ Projects | The project showcase pages · หน้าโครงการ |
| 📰 News & Activities | News articles and company activities · ข่าวสารและกิจกรรม |
| 🏷️ Activity Tags / 📂 Types | The colored badges and categories on news cards · ป้ายกำกับข่าว |
| ✅ Benefits | The benefit blocks on the home page · ข้อดีของบริการ |
| 🤝 Partners & Clients | The logo strips · โลโก้พาร์ทเนอร์และลูกค้า |
| 📞 Contact Channels | Phone, email, social links · ช่องทางติดต่อ |
| ✏️ Site Text | Every fixed heading and sentence (Thai + English) · ข้อความทั่วเว็บไซต์ |
| 🌄 Site Images | Standalone images such as the About banner · รูปภาพประกอบหน้าต่าง ๆ |

**Golden rule · กฎทอง:** when you press **Save · บันทึก**, the change is live
immediately. Visitors see it the next time they open or refresh the page.
There is no "publish" step.
เมื่อกด **บันทึก** การเปลี่ยนแปลงจะแสดงบนเว็บไซต์ทันที ไม่มีขั้นตอน "เผยแพร่" เพิ่มเติม

> Your team can also keep editing directly in the Supabase Table Editor —
> both methods change the same data.
> ทีมยังสามารถแก้ไขผ่าน Supabase Table Editor ได้เหมือนเดิม — ทั้งสองวิธีแก้ข้อมูลชุดเดียวกัน

---

## 2. Changing a photo · เปลี่ยนรูปภาพ ⭐ most common task

Example: changing a hero banner photo on the home page.

1. Log in (see above).
2. Click **🖼️ Hero Banners** in the left menu.
3. Click **✏ Edit** on the banner you want to change.
4. Under **Background photo**, click **⬆ Upload image** ·
   กดปุ่ม **⬆ Upload image** เพื่ออัปโหลดรูปจากเครื่องของคุณ
5. Choose a photo from your computer and wait a few seconds —
   the preview changes to your new photo.
6. Click **💾 Save · บันทึก**. A green message confirms it.
7. Check it: open the website and refresh (press F5).
   ตรวจสอบ: เปิดเว็บไซต์แล้วกด F5

**Photo tips · เคล็ดลับรูปภาพ:**
- Hero banners look best **wide**, around **1920 × 1080 pixels**.
- Project card photos: around **800 × 600 pixels**.
- Partner logos: **PNG with transparent background**.
- Use JPG or PNG. If the file is bigger than ~2 MB the page loads slowly —
  resize large phone photos first if you can.

---

## 3. Changing text · แก้ไขข้อความ

1. Click **✏️ Site Text** in the left menu.
2. Type a word you remember into the **search box** at the top —
   it finds matching texts in English or Thai.
   พิมพ์คำที่จำได้ลงในช่องค้นหา — ค้นได้ทั้งภาษาไทยและอังกฤษ
3. Click **✏ Edit**. Each text has two boxes: **ภาษาไทย** and **English**.
   Edit both so the two language versions stay consistent.
   แก้ทั้งสองภาษาเพื่อให้เว็บไซต์สองภาษาตรงกัน
4. Click **💾 Save · บันทึก**.

⚠️ Do **not** change the **Key** field — the website uses it to find the
text. (ห้ามแก้ช่อง **Key** — เว็บไซต์ใช้ค้นหาข้อความ)

---

## 4. Projects · โครงการ

### Edit an existing project · แก้ไขโครงการเดิม
1. Click **☀️ Projects**, then **✏ Edit** next to the project.
2. Change any field — every field has a label, and texts have TH + EN boxes:
   - **Project title / Client / Location** — the words on the page.
   - **Capacity (kWp), Year completed** — the numbers on the card.
   - **Short teaser** — shown on the project list.
   - **Full details** — the project page story. Leave an empty line
     between paragraphs. (เว้นบรรทัดว่างระหว่างย่อหน้า)
   - **Card photo / Page banner photo** — use **⬆ Upload image**.
   - **Photo gallery** — click **+ Add photo(s)**; use ↑ ↓ to reorder,
     ✕ to remove.
3. Click **💾 Save · บันทึก**.

### Add a new project · เพิ่มโครงการใหม่
Click **+ Add new · เพิ่มใหม่**, fill in the form, **Save**.

The statistics on the home page (number of projects, total capacity)
update **automatically** from this list — you never edit them directly.
สถิติหน้าแรกคำนวณอัตโนมัติจากรายการโครงการ ไม่ต้องแก้เอง

### Remove one · ลบ
Click **Delete** and confirm. **Careful — this cannot be undone.**
(ระวัง — การลบย้อนกลับไม่ได้)

---

## 5. News & Activities · ข่าวสารและกิจกรรม

Works exactly like projects. Extra fields:
- **Tag badge** and **Activity type** — pick from the dropdown lists.
  The badges themselves are managed in **🏷️ Activity Tags** and
  **📂 Activity Types**.

---

## 6. Partner and client logos · โลโก้พาร์ทเนอร์

1. Open **🤝 Partners & Clients**.
2. **+ Add new** → type the name → **⬆ Upload image** for the logo.
3. Choose the **Strip · แถบที่แสดง**:
   - `client` → Enterprises That Trust Us (ลูกค้า)
   - `vendor` → Technology Partners (พาร์ทเนอร์เทคโนโลยี)
4. **Display order** controls position (1 = first) · ลำดับการแสดง (1 = แรกสุด)
5. **💾 Save**.

---

## 7. If something goes wrong · ถ้ามีปัญหา

- A change doesn't appear? Refresh the website page (F5). On a phone,
  close and reopen the browser tab.
  การแก้ไขไม่แสดง? กด F5 ที่หน้าเว็บไซต์
- Saved the wrong thing? Just edit it again and save.
  บันทึกผิด? แก้ไขใหม่แล้วบันทึกอีกครั้ง
- "No permission to save" error after your computer was idle?
  Sign out and sign in again.
  ขึ้นว่าไม่มีสิทธิ์บันทึก? ออกจากระบบแล้วเข้าใหม่
- Still stuck? Contact your administrator — nothing you do in the
  Content Manager can break the website's design or layout; those are
  protected.
  ติดปัญหา? ติดต่อผู้ดูแลระบบ — สิ่งที่ทำใน Content Manager
  ไม่สามารถทำให้ดีไซน์หรือเลย์เอาต์ของเว็บไซต์พังได้
