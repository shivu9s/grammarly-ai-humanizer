export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser, trackUserHumanization } from '../../lib/db';

const HUMANIZE_PROMPTS: Record<string, string> = {
  professional: `You are an expert human writer and copyeditor. Your goal is to rewrite the user's text so that it reads completely naturally, has a high human-like flow, and passes all AI detection tools (like ZeroGPT, GPTZero, Copyleaks, Turnitin) as 100% human-written.

Here is the exact blueprint for your rewrite:
- SENTENCE PACE: Break up the predictable sentence flow. Use a mix of brief sentences (3-5 words) to make points punchy, medium sentences (10-15 words), and complex sentences (20-30 words). Avoid having consecutive sentences of similar length.
- NO TRANSITION WORDS: Do not use formal AI transitions ("Furthermore", "Moreover", "Additionally", "Consequently", "In conclusion", "As a result", "Interestingly", "Importantly"). Crucially, do NOT use common "AI humanizer" conversational fillers ("Honestly,", "To be fair,", "Here's the thing:", "Basically,", "Plus,", "What this means is", "Truth is,"). Instead, write direct, active sentences that progress naturally.
- WORD BAN: Absolutely never use these AI signature words: "delve", "dive into", "dive in", "dive deep", "tapestry", "testament", "beacon", "nestled", "unravel", "realm", "dynamics", "synergy", "holistic", "comprehensive", "enhance", "streamline", "foster", "leverage", "utilize", "pivotal", "groundbreaking", "multifaceted", "not only but also", "showcase", "demystify".
- REWRITE BANNED WORDS: If the original input text contains any of these banned words (such as "delve", "dive into", "utilize", etc.), you must rewrite them using simpler, direct human alternatives.
- VOICE: Favor active, direct voice over passive. Write with active verbs and subjective ownership.
- STYLE: Use natural contractions ("it's", "don't", "can't", "we're", "I've", "there's") to sound like a human professional writing a clear, direct email or article.
- FORMATTING: Never output standard AI-structured bullet lists with bold titles unless requested. Write lists as flowing prose or informal, unequal bullet points.

---
EXAMPLE OF HUMAN REWRITING STYLE:
Original AI Text: "Furthermore, it is important to note that full-stack development is a multifaceted field where we must utilize cutting-edge solutions to enhance application efficiency. Additionally, delving into project requirements plays a key role in fostering collaboration among team members."

BAD AI-Style/Humanizer Rewrite: "Full-stack development is a complex field. We must use state-of-the-art solutions—this helps to improve efficiency. Plus, exploring project needs is key. Honestly, it builds collaboration among team members." (Flagged as AI due to repetitive sentence structure and common humanizer fillers like "Plus" and "Honestly").

GOOD Human Rewrite: "Full-stack development is messy. If you want apps to run fast, you need modern tools—there's no way around it. But code is only half the battle. You also have to talk to your team and figure out what you're building before writing script. That's where collaboration actually happens."
---

CRITICAL: Return ONLY the rewritten text. Absolutely no preamble, introductory sentences, explanations, or quotes. Output the exact rewritten text, matching the original paragraph count.`,

  casual: `You are a real person rewriting text so it sounds completely natural, friendly, and human. The rewritten text must easily pass all AI detection tools as 100% human-written.

Rules:
- TONE: Conversational, warm, direct. Write like you're texting a friend, writing a casual Slack message, or writing an informal blog post.
- PACE: Mix very short sentences (2-5 words. Like this. Seriously.) with longer, loose sentences. Avoid rigid patterns.
- CONTRACTIONS: Use contractions everywhere: "it's", "don't", "can't", "I'd", "we're", "that's", "should've", "could've".
- CONNECTORS: Do NOT use formal transitions ("furthermore", "moreover") or generic humanizer fillers ("Honestly,", "Basically,", "So,", "Plus,", "Here's the thing:", "To be fair,", "I mean,"). Just write directly from one point to the next.
- IMPERFECTIONS: Throw in natural colloquialisms, parenthetical side thoughts, and rhetorical questions to break the "perfect" AI structure.
- WORD BAN: Do not use: "delve", "dive into", "dive in", "dive deep", "tapestry", "leverage", "utilize", "foster", "pivotal", "groundbreaking", "unravel", "synergy", "comprehensive".
- REWRITE BANNED WORDS: If the original input text contains any of these banned words (such as "delve", "dive into", etc.), you must rewrite them using simpler, direct human alternatives.
- NO LISTS: Turn rigid AI list formats into loose paragraphs or casual, natural sentences.

---
EXAMPLE OF CASUAL HUMAN REWRITING STYLE:
Original AI Text: "Furthermore, it is important to note that full-stack development is a multifaceted field where we must utilize cutting-edge solutions to enhance application efficiency. Additionally, delving into project requirements plays a key role in fostering collaboration among team members."

BAD AI-Style Rewrite: "Full-stack development is a complex field. We must use state-of-the-art solutions to make apps more efficient. Also, exploring project needs is key to build collaboration." (Still too dry, robotic structure).

GOOD Human Rewrite: "Full-stack is a beast. If you want your apps to actually run fast, you've got to use modern tools. But code is only half of it. You also need to get on the same page with your team about what you're even building. That's where the real magic happens."
---

CRITICAL: Return ONLY the rewritten text. No introductory or concluding remarks, no markdown blocks, no quotes. Output only the rewritten text itself.`,

  academic: `You are an experienced scholarly writer and academic editor rewriting text to read as authentically human-authored. The output must pass AI detection tools while maintaining a rigorous, intellectual, and analytical tone.

Rules:
- SCHOLARLY PACING: Even academic human writers vary their pacing. Do not write consecutive sentences of the same length or syntax. Mix direct, punchy analytical statements with longer, multi-clause explanations.
- CONNECTORS: Avoid robotic transition templates (e.g., "Furthermore,", "Moreover,", "Additionally,", "In conclusion,"). Also avoid casual filler transitions. Instead, use natural academic transitions like "That said,", "Indeed,", "Importantly,", "In practice,", "Specifically,", "To put it differently,", "What this suggests is".
- ACTIVE VOICE & AGENCY: Convert dry passive voice into active where appropriate (e.g., "We examined" or "This analysis demonstrates" instead of "An examination was performed").
- WORD BAN: Absolutely never use clichéd AI academic words: "delve", "dive into", "dive in", "dive deep", "tapestry", "multifaceted", "holistic", "paradigm", "synergy", "robust", "comprehensive", "leverage", "utilize", "foster", "groundbreaking", "testament", "not only but also".
- REWRITE BANNED WORDS: If the original input text contains any of these banned words, you must rewrite them using simpler, direct human alternatives.
- SYNTAX VARIATION: Vary sentence openers. Avoid repeating the same starting words. Start some sentences with prepositional phrases, some with subordinate clauses, and some with direct subjects.

---
EXAMPLE OF ACADEMIC HUMAN REWRITING STYLE:
Original AI Text: "Furthermore, it is important to note that full-stack development is a multifaceted field where we must utilize cutting-edge solutions to enhance application efficiency. Additionally, delving into project requirements plays a key role in fostering collaboration among team members."

BAD AI-Style Rewrite: "Furthermore, full-stack development is complex, requiring state-of-the-art solutions to improve efficiency. Additionally, examining project needs is vital for team collaboration." (Still repeats traditional AI transitional markers).

GOOD Human Rewrite: "Full-stack development demands adaptability. Optimizing application performance requires modern tools, yet technical implementation is only one component of success. Project outcomes rely equally on how effectively developers define requirements early on, making pre-development collaboration essential."
---

CRITICAL: Return ONLY the rewritten text. No introduction, no summary, no quotes. Output only the rewritten academic text.`,

  creative: `You are a talented creative writer with a strong, expressive human voice. Your goal is to rewrite the text to sound completely unique, vivid, and unmistakably human, passing all AI detection software as 100% human-written.

Rules:
- IMAGINATION: Use strong active verbs, natural sensory details, and unexpected descriptions. Inject personality.
- PACING: Make sentence length dramatically irregular. Use tiny sentence fragments for dramatic effect (e.g., "Just like that. Gone.") alongside winding, expressive sentences that drift through multiple ideas.
- FORMATTING: Avoid standard, robotic list layouts. Tell a story or weave information into a fluid narrative.
- CONNECTORS & PUNCTUATION: Use parenthetical asides, em-dashes, and conversational connectors ("Actually,", "Picture this:"). Never use formal transitions or repetitive fillers ("Honestly", "To be fair", "Plus").
- WORD BAN: Do not use AI clichés: "delve", "dive into", "dive in", "dive deep", "tapestry", "realm", "dynamics", "foster", "leverage", "utilize", "pivotal", "groundbreaking", "beacon", "nestled", "unravel", "synergy".
- REWRITE BANNED WORDS: If the original input text contains any of these banned words, you must rewrite them using simpler, direct human alternatives.
- EXPRESSION: Use contractions and colloquialisms naturally to sound like an active human storyteller.

---
EXAMPLE OF CREATIVE HUMAN REWRITING STYLE:
Original AI Text: "Furthermore, it is important to note that full-stack development is a multifaceted field where we must utilize cutting-edge solutions to enhance application efficiency. Additionally, delving into project requirements plays a key role in fostering collaboration among team members."

BAD AI-Style Rewrite: "Full-stack development is a wild field where we need to use new tools to make things faster. Exploring project needs is a key spark that helps teams work together." (Generic, flat metaphors).

GOOD Human Rewrite: "Building for the web is a chaotic, multi-layered puzzle. If you want a product that doesn't crawl, you need fresh, sharp tools—period. But writing code is the easy part. The real magic happens when you get a room full of developers to actually talk, align, and sketch out the blueprint before a single line is written."
---

CRITICAL: Return ONLY the rewritten text. Do not add intro text ("Here is the creative rewrite:") or explanations. Output only the raw rewritten text.`
};

const STRENGTH_MODIFIERS: Record<string, string> = {
  low: `\n\nREWRITE STRENGTH: LIGHT. Make minimal changes. Focus on inserting contractions, changing typical AI words, and slight sentence adjustments. Keep the layout close to the original.`,
  medium: `\n\nREWRITE STRENGTH: MODERATE. Paraphrase sentences with different grammatical structures. Change word choices, vary sentence lengths, break up parallelisms, and use contractions naturally.`,
  high: `\n\nREWRITE STRENGTH: AGGRESSIVE. Completely reconstruct every sentence. Change the sentence boundaries, merge or split thoughts, and shuffle paragraph phrasing. Use different vocabulary and syntax models while retaining all facts. The structure must be completely fresh and unrecognizable from the original text.`
};

// IP Rate limiting map
const ipLimits = new Map<string, number[]>();

function checkIpRateLimit(ip: string): { allowed: boolean; count: number } {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  let timestamps = ipLimits.get(ip) || [];
  // Filter for last 24 hours
  timestamps = timestamps.filter(t => t > oneDayAgo);
  
  if (timestamps.length >= 10) {
    ipLimits.set(ip, timestamps); // save filtered list
    return { allowed: false, count: timestamps.length };
  }
  
  timestamps.push(now);
  ipLimits.set(ip, timestamps);
  return { allowed: true, count: timestamps.length };
}

export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
  try {
    const body = await request.json();
    const { text, tone = 'professional', strength = 'medium', language = 'english' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve authenticated user from cookies
    const loggedInUser = await getAuthenticatedUser(cookies);

    const isPremium = loggedInUser?.isPremium || false;
    const maxWordLimit = isPremium ? 2000 : 500;

    // 1. Max word check based on tier
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length > maxWordLimit) {
      return new Response(JSON.stringify({ 
        error: `Text exceeds the maximum limit of ${maxWordLimit} words. Please shorten your text and try again.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }



    const groqApiKey = (import.meta.env.GROQ_API_KEY || '').trim();
    
    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      return new Response(JSON.stringify({
        error: 'GROQ_API_KEY is not configured. Please add your API key to the .env file.',
        fallback: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Select prompt based on tone
    const basePrompt = HUMANIZE_PROMPTS[tone] || HUMANIZE_PROMPTS.professional;
    const strengthMod = STRENGTH_MODIFIERS[strength] || STRENGTH_MODIFIERS.medium;
    const fullPrompt = basePrompt + strengthMod;

    // Build the language instruction for the user prompt
    const langInstruction = language && language !== 'english'
      ? `\n\nIMPORTANT: Write the entire output in ${language}. Do not include any English text.`
      : '';
    const userPrompt = `Rewrite the following text to be 100% human-written and completely bypass AI detectors, preserving the exact original meaning and factual details. Output ONLY the rewritten text:${langInstruction}\n\n${text}`;

    let rewrittenText = '';
    let usedModel = '';

    // Call Groq API
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: fullPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 1.2,
          max_tokens: 4096
        })
      });

      if (response.ok) {
        const data = await response.json();
        rewrittenText = data.choices?.[0]?.message?.content?.trim() || '';
        if (rewrittenText) {
          usedModel = 'Llama 3.3 70B (Groq)';
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn('Groq API returned error status:', response.status, errData);
      }
    } catch (groqError: any) {
      console.warn('Groq API call failed:', groqError.message || groqError);
    }

    // =========================================================================
    // POST-PROCESSING PERTURBATION ENGINE
    // This is the critical layer that actually defeats AI detectors.
    // LLMs produce text with inherently low perplexity (high predictability).
    // This engine introduces genuine randomness into word choice, sentence
    // boundaries, and structure AFTER the LLM generates the text, breaking
    // the statistical fingerprint that detectors look for.
    // =========================================================================

    function postProcessHumanize(text: string, strength: string): string {
      // --- Synonym pools: common words → less predictable alternatives ---
      const synonymPools: Record<string, string[]> = {
        'important': ['crucial', 'critical', 'key', 'significant', 'vital'],
        'significant': ['notable', 'meaningful', 'substantial', 'considerable'],
        'however': ['but', 'yet', 'still', 'though', 'on the flip side'],
        'therefore': ['so', 'as such', 'because of this', 'for that reason'],
        'effectively': ['well', 'properly', 'successfully', 'in practice'],
        'specifically': ['in particular', 'namely', 'to be exact'],
        'particularly': ['especially', 'notably', 'in particular'],
        'demonstrate': ['show', 'prove', 'illustrate', 'make clear'],
        'demonstrates': ['shows', 'proves', 'illustrates', 'makes clear'],
        'significantly': ['greatly', 'substantially', 'considerably', 'noticeably'],
        'implementation': ['rollout', 'setup', 'execution', 'deployment'],
        'functionality': ['features', 'capabilities', 'behavior'],
        'methodology': ['method', 'approach', 'technique', 'process'],
        'facilitate': ['help', 'support', 'enable', 'make easier'],
        'facilitates': ['helps', 'supports', 'enables', 'makes easier'],
        'fundamental': ['core', 'basic', 'essential', 'central'],
        'contribute': ['help', 'add to', 'play a part in', 'support'],
        'contributes': ['helps', 'adds to', 'plays a part in', 'supports'],
        'essential': ['necessary', 'critical', 'needed', 'required'],
        'numerous': ['many', 'several', 'a lot of', 'plenty of'],
        'regarding': ['about', 'on', 'concerning', 'when it comes to'],
        'approximately': ['about', 'around', 'roughly', 'close to'],
        'consequently': ['so', 'as a result', 'because of that'],
        'environment': ['setting', 'context', 'space', 'setup'],
        'approach': ['method', 'strategy', 'way', 'tactic'],
        'strategy': ['plan', 'approach', 'method', 'game plan'],
        'optimize': ['improve', 'fine-tune', 'speed up', 'make better'],
        'optimizing': ['improving', 'fine-tuning', 'speeding up', 'making better'],
        'ensure': ['make sure', 'guarantee', 'confirm', 'verify'],
        'ensures': ['makes sure', 'guarantees', 'confirms', 'verifies'],
        'utilize': ['use', 'work with', 'apply', 'put to use'],
        'requires': ['needs', 'calls for', 'demands', 'takes'],
        'potential': ['possible', 'likely', 'expected', 'promising'],
        'primarily': ['mainly', 'mostly', 'largely', 'chiefly'],
        'additionally': ['also', 'on top of that', 'and', 'plus'],
        'currently': ['right now', 'at the moment', 'today', 'as things stand'],
        'individuals': ['people', 'folks', 'users', 'team members'],
        'opportunities': ['chances', 'options', 'openings', 'possibilities'],
        'professional': ['career', 'work', 'industry', 'business'],
        'development': ['growth', 'progress', 'building', 'creation'],
        'experience': ['background', 'history', 'time spent', 'exposure'],
        'technologies': ['tools', 'tech', 'platforms', 'systems'],
        'collaboration': ['teamwork', 'working together', 'cooperation', 'joint effort'],
        'communication': ['messaging', 'talking', 'discussion', 'dialogue'],
        'understanding': ['grasp', 'knowledge', 'sense of', 'familiarity with'],
        'innovative': ['creative', 'fresh', 'new', 'original'],
        'established': ['proven', 'well-known', 'recognized', 'set'],
        'challenging': ['tough', 'demanding', 'difficult', 'hard'],
      };

      // --- Contraction toggle maps ---
      const expansions: [RegExp, string][] = [
        [/\bI'm\b/g, 'I am'],
        [/\bwe're\b/g, 'we are'],
        [/\bthat's\b/g, 'that is'],
        [/\bthere's\b/g, 'there is'],
        [/\bwho's\b/g, 'who is'],
      ];
      const contractions: [RegExp, string][] = [
        [/\bI have\b/g, "I've"],
        [/\bI would\b/g, "I'd"],
        [/\bwe have\b/g, "we've"],
        [/\bthey have\b/g, "they've"],
        [/\bshould have\b/g, "should've"],
        [/\bcould have\b/g, "could've"],
        [/\bwould have\b/g, "would've"],
        [/\bwill not\b/g, "won't"],
        [/\bshould not\b/g, "shouldn't"],
      ];

      // --- Filler injections (used sparingly and randomly) ---
      const midSentenceFillers = [
        ', I think,',
        ', in my view,',
        ', from what I can tell,',
        ' — at least in my experience —',
        ', to some extent,',
        ', if you ask me,',
      ];

      const sentenceStarters = [
        'I should mention that ',
        'The way I see it, ',
        'From my perspective, ',
        'In my experience, ',
        'Looking at it practically, ',
      ];

      let paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

      paragraphs = paragraphs.map(para => {
        // Split into sentences
        let sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

        // --- Pass 1: Random synonym substitution ---
        const swapRate = strength === 'high' ? 0.4 : strength === 'medium' ? 0.25 : 0.12;
        sentences = sentences.map(sent => {
          const words = sent.split(/\b/);
          return words.map(word => {
            const lower = word.toLowerCase();
            if (synonymPools[lower] && Math.random() < swapRate) {
              const pool = synonymPools[lower];
              const replacement = pool[Math.floor(Math.random() * pool.length)];
              // Preserve capitalization
              if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
              }
              return replacement;
            }
            return word;
          }).join('');
        });

        // --- Pass 2: Random contraction toggling (expand some, contract others) ---
        sentences = sentences.map(sent => {
          if (Math.random() < 0.3) {
            // Randomly expand a contraction
            const rule = expansions[Math.floor(Math.random() * expansions.length)];
            sent = sent.replace(rule[0], rule[1]);
          }
          if (Math.random() < 0.3) {
            // Randomly contract an expansion
            const rule = contractions[Math.floor(Math.random() * contractions.length)];
            sent = sent.replace(rule[0], rule[1]);
          }
          return sent;
        });

        // --- Pass 3: Sentence splitting (long sentences → 2 shorter ones) ---
        if (strength !== 'low') {
          const newSentences: string[] = [];
          sentences.forEach(sent => {
            const wordCount = sent.split(/\s+/).length;
            if (wordCount > 22 && Math.random() < 0.35) {
              // Try to split at a comma followed by a conjunction
              const splitPatterns = [', and ', ', but ', ', which ', ', so '];
              let didSplit = false;
              for (const pattern of splitPatterns) {
                const idx = sent.indexOf(pattern);
                if (idx > 10 && idx < sent.length - 15) {
                  const first = sent.substring(0, idx) + '.';
                  let second = sent.substring(idx + pattern.length).trim();
                  second = second.charAt(0).toUpperCase() + second.slice(1);
                  if (!second.endsWith('.') && !second.endsWith('!') && !second.endsWith('?')) {
                    second += '.';
                  }
                  newSentences.push(first);
                  newSentences.push(second);
                  didSplit = true;
                  break;
                }
              }
              if (!didSplit) newSentences.push(sent);
            } else {
              newSentences.push(sent);
            }
          });
          sentences = newSentences;
        }

        // --- Pass 4: Sentence merging (2 short sentences → 1 compound) ---
        if (strength !== 'low') {
          const mergedSentences: string[] = [];
          for (let i = 0; i < sentences.length; i++) {
            const current = sentences[i];
            const next = sentences[i + 1];
            if (next && current.split(/\s+/).length < 8 && next.split(/\s+/).length < 10 && Math.random() < 0.25) {
              const connectors = [' — ', '; ', ', and '];
              const connector = connectors[Math.floor(Math.random() * connectors.length)];
              let merged = current.replace(/[.!?]$/, '') + connector + next.charAt(0).toLowerCase() + next.slice(1);
              mergedSentences.push(merged);
              i++; // skip next
            } else {
              mergedSentences.push(current);
            }
          }
          sentences = mergedSentences;
        }

        // --- Pass 5: Insert mid-sentence filler (very sparingly, ~10% of sentences) ---
        if (strength !== 'low') {
          sentences = sentences.map(sent => {
            const words = sent.split(/\s+/);
            if (words.length > 12 && Math.random() < 0.1) {
              const insertPos = Math.floor(words.length * 0.4) + Math.floor(Math.random() * 3);
              const filler = midSentenceFillers[Math.floor(Math.random() * midSentenceFillers.length)];
              words.splice(insertPos, 0, filler);
              return words.join(' ');
            }
            return sent;
          });
        }

        // --- Pass 6: Prepend a sentence starter to one sentence per paragraph ---
        if (strength !== 'low' && sentences.length > 3 && Math.random() < 0.3) {
          const targetIdx = 1 + Math.floor(Math.random() * (sentences.length - 2));
          const starter = sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)];
          const sent = sentences[targetIdx];
          sentences[targetIdx] = starter + sent.charAt(0).toLowerCase() + sent.slice(1);
        }

        return sentences.join(' ');
      });

      return paragraphs.join('\n\n');
    }

    // 3. Handle response return
    if (rewrittenText) {
      // Apply post-processing perturbation to break AI statistical patterns
      rewrittenText = postProcessHumanize(rewrittenText, strength);

      return new Response(JSON.stringify({
        output: rewrittenText,
        model: usedModel,
        tone,
        strength
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. If both failed, return fallback flag
    const noKeysConfigured = !groqApiKey || groqApiKey === 'your_groq_api_key_here';
    const errorMsg = noKeysConfigured 
      ? 'No API keys configured. Please add GROQ_API_KEY to your .env file.'
      : 'The configured Groq API exceeded quota or failed. Falling back to local humanizer engine.';

    return new Response(JSON.stringify({
      error: errorMsg,
      fallback: true
    }), {
      status: 200, // Return 200 so the client can parse the fallback parameter gracefully
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Humanize API error:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Failed to humanize text',
      fallback: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
