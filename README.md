# Invigilation Duty Finder

A static GitHub Pages website that reads repository PDFs in the browser:

- `duty-roster.pdf` - faculty duties, dates, slots, and examination notices
- `faculty-list.pdf` - designation, phone number, and email address
- `exam-committee.pdf` - committee role and contact information
- seat-plan PDFs such as `27A_Seat Plan.pdf` - room-wise student counts for attendance sheets

## Upload to GitHub

Upload every file from this package directly to the repository root. There are
no required folders.

```text
.nojekyll
index.html
guidelines.html
committee.html
attendance.html
styles.css
app.js
guidelines.js
committee.js
attendance.js
theme.js
duty-roster.pdf
faculty-list.pdf
exam-committee.pdf
27A_Seat Plan.pdf
27B_Seat Plan.pdf
27C_Seat Plan.pdf
pdf.min.js
pdf.worker.js
pdf-lib.min.js
PDF.js-LICENSE.txt
```

Configure GitHub Pages:

```text
Settings > Pages
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

## Update published information

Replace any PDF while keeping its exact repository filename:

```text
duty-roster.pdf
faculty-list.pdf
exam-committee.pdf
```

For attendance-sheet generation, upload seat-plan PDFs to the repository root.
The page uses the selected date and slot to try predictable filenames such as:

```text
27A_Seat Plan.pdf
27B_Seat Plan.pdf
27C_Seat Plan.pdf
27-A_Seat Plan.pdf
seat-plan-27-A.pdf
```

The website uses cache-busting requests, so refreshed pages read the newly
published PDFs. The replacement PDFs should preserve the same general table
structure and remain text-based rather than scanned images.

The committee PDF may include a column labeled `Room` or `Room No.`. Committee
portraits should be uploaded to the repository root as JPEG files named with
the exact faculty initial:

```text
AAK.jpeg
MJZ.jpeg
MHS.jpeg
```

If an image is missing, the website displays the member's initial instead.

When installing this version, replace all HTML, CSS, and JavaScript files in
the repository. The pages use Version 19 cache-busting query parameters so the
new layout is loaded instead of a previously cached copy.

Version 19 includes the Attendance Sheet Generator page. It reads the duty roster,
loads the matching seat-plan PDF, counts students in each room, assigns
invigilators using the 30/55/75/>75 rule, allows manual editing, and downloads
a printable PDF or editable DOCX styled like the sample attendance sheet. If
the duty roster has more faculty than the room requirement, all extra
invigilators are assigned to Room 204 at the end of the attendance sheet.
Teacher initials are kept only in
the Teacher Initial column, and the last PDF page table ends after the final
Room 204 row. When a room has multiple invigilators, the Room No. cell is
merged across those invigilator rows in the downloaded PDF. The light/dark
preference is stored only in the visitor's browser.

Committee photos are matched by faculty initial in the repository root. The
site tries no-extension files plus `.jpeg`, `.jpg`, `.png`, `.gif`, `.gpeg`,
`.webp`, and `.jfif` with uppercase and lowercase variants before showing the
initial fallback. It also checks common folders such as `images/`, `img/`,
`photos/`, `assets/`, and `assets/images/`.

In dark mode, attendance-page controls, summary cards, room headers, inline
chips, and warning panels use dark surfaces with white text for clear contrast.

No server, database, PHP, XAMPP, or build command is required.
