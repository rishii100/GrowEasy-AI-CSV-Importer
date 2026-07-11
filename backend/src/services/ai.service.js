const Groq = require('groq-sdk');
const { chunkArray, sleep } = require('../utils/helpers');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama3-70b-8192';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 15;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES, 10) || 3;
const RETRY_DELAY_MS = 1500;

// ── Prompt ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a CRM data extraction expert for GrowEasy, a real estate CRM platform.
Your task: intelligently map raw CSV records (with arbitrary column names) into the GrowEasy CRM schema.

OUTPUT FORMAT
Return ONLY a valid JSON object — no markdown fences, no explanations — with this exact structure:
{
  "imported": [ /* successfully mapped CRM records */ ],
  "skipped":  [ /* records that MUST be skipped (reason below) */ ]
}

CRM SCHEMA (map every field you can find):
- created_at       : Lead creation date. Must be parseable by JavaScript new Date(). Convert any date format.
- name             : Full name of the lead.
- email            : Primary email address only.
- country_code     : Phone country code (e.g. "+91", "+1"). Include the "+" prefix.
- mobile_without_country_code : Phone number digits only, no spaces/dashes, no country code.
- company          : Company or organisation name.
- city             : City name.
- state            : State or province.
- country          : Country name.
- lead_owner       : Email or name of the person who owns this lead.
- crm_status       : MUST be exactly one of: GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE
                     Infer from context (e.g. "interested" → GOOD_LEAD_FOLLOW_UP, "not reachable" → DID_NOT_CONNECT,
                     "not interested" → BAD_LEAD, "deal closed" → SALE_DONE). Leave blank if truly unclear.
- crm_note         : Aggregate ALL of: remarks, follow-up notes, comments, additional phone numbers (beyond the first),
                     additional email addresses (beyond the first), and any info that doesn't fit another field.
- data_source      : MUST be exactly one of: leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots
                     Match from the source/campaign/project column if it closely maps. Leave blank if none match confidently.
- possession_time  : Property possession timeline if mentioned.
- description      : Any remaining additional context or description.

STRICT RULES:
1. SKIP a record if it has NO email AND NO mobile number. Add it to the "skipped" array with a "skip_reason" field.
2. If multiple emails exist, put the FIRST in "email" and append the rest to "crm_note".
3. If multiple phone numbers exist, put the FIRST in "mobile_without_country_code" and append the rest to "crm_note".
4. crm_status and data_source MUST use only the allowed values above or be left as an empty string "".
5. created_at must be a valid date string parseable by JavaScript new Date(). If invalid/missing, use today's ISO date.
6. Do NOT invent data. If a field cannot be determined, use "".
7. Each record must be a flat JSON object. Do NOT include nested objects.
8. Return ONLY the JSON object. No extra text whatsoever.`;

// ── Core AI call with retry ──────────────────────────────────────────────────

async function callGroqWithRetry(batch, attempt = 1) {
  const prompt = `Extract CRM fields from the following ${batch.length} CSV records. 
Each record is a JSON object with the original CSV column names as keys.

Records:
${JSON.stringify(batch, null, 2)}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    return parseAiResponse(raw, batch);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[AI] Attempt ${attempt} failed — retrying in ${RETRY_DELAY_MS}ms...`, err.message);
      await sleep(RETRY_DELAY_MS * attempt); // exponential-ish back-off
      return callGroqWithRetry(batch, attempt + 1);
    }
    console.error(`[AI] All ${MAX_RETRIES} attempts failed for batch of ${batch.length} records.`);
    // Treat entire batch as skipped on total failure
    return {
      imported: [],
      skipped: batch.map((r) => ({ ...r, skip_reason: `AI extraction failed after ${MAX_RETRIES} retries.` })),
    };
  }
}

// ── Response parser ──────────────────────────────────────────────────────────

function parseAiResponse(raw, batch) {
  try {
    // Strip any accidental markdown fences the model may add
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      parsed &&
      Array.isArray(parsed.imported) &&
      Array.isArray(parsed.skipped)
    ) {
      return parsed;
    }

    throw new Error('Unexpected structure');
  } catch (e) {
    console.error('[AI] JSON parse failed:', e.message, '\nRaw:', raw.slice(0, 300));
    // Fallback: mark entire batch as skipped
    return {
      imported: [],
      skipped: batch.map((r) => ({ ...r, skip_reason: 'AI response could not be parsed.' })),
    };
  }
}

// ── Public service ────────────────────────────────────────────────────────────

/**
 * Extracts CRM records from raw CSV rows using the Groq LLM.
 * Processes rows in batches and aggregates results.
 *
 * @param {Array<Record<string,string>>} rawRows
 * @returns {Promise<{ imported: object[], skipped: object[] }>}
 */
async function extractCrmRecords(rawRows) {
  const batches = chunkArray(rawRows, BATCH_SIZE);
  const allImported = [];
  const allSkipped = [];

  console.log(`[AI] Processing ${rawRows.length} rows in ${batches.length} batch(es) of ≤${BATCH_SIZE}`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`[AI] Batch ${i + 1}/${batches.length} — ${batches[i].length} records`);
    const result = await callGroqWithRetry(batches[i]);
    allImported.push(...result.imported);
    allSkipped.push(...result.skipped);

    // Small courtesy delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await sleep(300);
    }
  }

  return { imported: allImported, skipped: allSkipped };
}

module.exports = { extractCrmRecords };
