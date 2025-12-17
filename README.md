# Legacy Data Extractor AI (Full Stack)

This contains everything you need to run your app locally with a backend API and MongoDB.

## Stack
- Client: Vite + React + TypeScript
- Server: Express + TypeScript + Mongoose
- Database: MongoDB (`mongodb://localhost:27017/legacy-data-extractor-ai`)

## Run Locally

**Prerequisites:** Node.js 18+, MongoDB accessible on port `27018`.

1. Install both:
   `npm run install:all`
2. Configure client AI (optional):
   - No API key required. By default the app uses an offline parser.
   - To enable online AI, set `USE_AI=true`  in `frontend/.env.local`.
3. Configure server env (already seeded):
   - `backend/.env` has `MONGODB_URI`, `PORT`, and `JWT_SECRET` (edit to a secure value)
4. Start the backend API:
   `npm run dev:back`
5. Start the frontend:
   `npm run dev:front`
6. Or start both:
   `npm run dev:full`

The client proxies API requests from `/api` to `http://localhost:5000`.
MongoDB example start:
`mongod --port 27018 --dbpath .\\backend\\data27017`

## Authentication & Storage
- Register and login with email/password (6+ chars). JWT token is stored in `sessionStorage` as `authToken`.
- Extraction history is stored per user in MongoDB and loaded in the dashboard.

## Security
- Backend includes Helmet, rate limiting, request logging, and MongoDB input sanitization.
- Database connection uses retry logic to handle temporary outages without crashing.

## More Information about this must be know::
Value For Companies

Accelerates data migration from legacy text/CSV/logs into modern systems.
Reduces manual data entry and spreadsheet cleanup by turning messy strings into structured rows.
Improves data quality with repeatable schemas and versioned history per company.
Enables fast reporting: export clean CSV to Excel, BI tools, or upload to ERP/CRM.
Supports governance: company-scoped storage keeps each tenant’s data isolated.
Typical Use Cases

Legacy system sunset: extract master data (customers, vendors, products) into a clean CSV for import.
Back-office operations: parse daily batch logs into table form for reconciliation.
Compliance and audit: capture “what was extracted, when, and by whom” for traceability.
Analytics prep: normalize semi-structured lines or emails into tabular features for BI.
How It Works

Define a schema (columns) that matches the business objects you need.
Paste legacy text or upload content; the app extracts structured rows.
Review and edit in the table; export CSV for Excel or save as a company-scoped document.
History and documents are partitioned by companyName, so each company only sees its own data.
Market Alternatives

Intelligent Document Processing (IDP): ABBYY FlexiCapture, Kofax, UiPath Document Understanding, Hyperscience, Rossum.
Cloud AI services: Google Document AI, Amazon Textract, Microsoft AI Builder (Form Processing).
Parser-focused tools: Docparser, Mailparser, Import.io, Talend Data Preparation, Power Automate flows.
Difference: those focus heavily on scanned PDFs/forms and high-volume workflows. This app targets semi-structured text/CSV strings with quick, schema-driven extraction and multi-tenant isolation, plus tight Excel integration.
Differentiators

Lightweight, fast onboarding: define schema and start extracting in minutes.
Company-level isolation built-in; easier multi-tenant compliance than ad‑hoc spreadsheets.
Excel-first workflow: one-click CSV export and auto-download on save.
Developer-friendly backend (Mongo + REST) for integrating with internal tools.
Implementation Steps

Identify legacy sources and target schemas (customer, vendor, order log, etc.).
Create company accounts; set companyName so data is partitioned correctly.
Run extractions, validate in the table, save documents for audit, and export CSV.
Import CSVs into downstream systems (ERP/CRM/data warehouse).
Establish a recurring flow: standardized templates and scheduled extracts.
ROI Considerations

Labor savings: reduce manual rekeying and spreadsheet wrangling.
Faster migrations: cut weeks of data cleanup to days/hours.
Fewer data defects: repeatable schemas and persisted history reduce inconsistencies.
Compliance gains: auditable, company-scoped history supports SOC/ISO/GxP processes.
Limitations And Mitigations

Extraction accuracy depends on input regularity; add templates and validation rules.
Very large files or PDFs are better served by IDP tools; integrate when needed.
Access control beyond company scoping (roles, SSO) may be required in enterprises; can be added.
Near-Term Enhancements

Role-based access (admin/editor/viewer) per company and SSO integration.
CSV/Excel upload to process existing files directly.
Templates library for common legacy formats.
Connectors/webhooks to push cleaned data automatically to ERP/CRM/warehouse.
Bottom line: yes, it’s useful for companies. It turns messy legacy data into clean, governed, company-scoped datasets that can be edited in Excel and imported anywhere, cutting cost and time on migrations and back-office operations while improving auditability.
