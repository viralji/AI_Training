// All slide content extracted from the original HTML
export const slideContent = {
  'chapter-1': {
    type: 'dual-youtube',
    title: '1 • Welcome to AI',
    subtitle: 'Kick-off + short Bollywood-style intro clip',
    videos: [
      {
        title: 'Clip 1 - Introduction',
        videoId: 'FHLl_gBqbUY',
        startTime: 10,
        subtitle: 'Starting at 10 seconds'
      },
      {
        title: 'Clip 2 - Main Content',
        videoId: 'FHLl_gBqbUY',
        startTime: 613,
        subtitle: 'Starting at 10:13'
      }
    ],
    allowFullscreen: true
  },
  
  'slide-1': {
    type: 'grid-4',
    title: 'The 4 Revolutions — From Electricity to Intelligence',
    subtitle: 'Each revolution transformed how we work. <mark>AI is the biggest leap yet.</mark>',
    panels: [
      {
        title: '2️⃣ Industrial (Electricity)',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
        timeframe: '~1870–1914'
      },
      {
        title: '3️⃣ Digital / Information',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
        timeframe: '~1960s–2000s'
      },
      {
        title: '4️⃣ Networked / Industry 4.0',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
        timeframe: '~2010s–present'
      },
      {
        title: '⭐ AI Revolution (We Are Here!)',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        timeframe: '~2022–present',
        highlight: true
      }
    ],
    legend: 'AI doesn\'t just automate tasks — it understands context, creates content, and makes decisions.'
  },

  'slide-2': {
    type: 'table',
    title: 'Queues from Online — A Journey We All Lived',
    subtitle: 'Then vs Now (side‑by‑side) for everyday tasks',
    table: {
      headers: ['Task', 'Then', 'Now'],
      rows: [
        ['Stand in bank queues', 'Counters, paper forms, limited hours.', 'UPI, NetBanking, ATMs — 24×7.'],
        ['Call from PCO booths', 'PCO & landline dependency.', 'Smartphones, VoIP, video calls.'],
        ['Adjust TV antennas for Doordarshan', 'Analog signal, rooftop antenna.', 'DTH & OTT streaming on‑demand.'],
        ['Money orders & IRCTC counters', 'Manual forms & counter-based workflows.', 'IMPS/NEFT/UPI & IRCTC app.'],
        ['Develop camera film & rent CDs/DVDs', 'Film development & physical media.', 'Phone cameras, cloud photos, streaming.']
      ]
    },
    message: 'We\'ve moved from physical queues to online flows—AI is the next shift from online to intelligent.'
  },

  'slide-1ce': {
    type: 'grid-2',
    title: 'Solutions built at CloudExtel',
    subtitle: 'Four high‑impact initiatives (generic summaries — plug details later)',
    panels: [
      {
        title: '1) AI‑powered DN Processing',
        points: [
          '🤖 Automates analysis of Demand Notes from <mark>government authorities</mark> with budget comparison and approval workflow.',
          '⚡ Reduces turnaround time from 2 days to 30 minutes (95% faster).',
          '📊 AI extracts data, compares budgets, and generates time-series graphs automatically.',
          '✅ Eliminates manual errors and enables real-time financial control with instant budget tracking.'
        ]
      },
      {
        title: '2) Policy Chatbot',
        points: [
          '💬 First <mark>RAG-based chatbot</mark> that answers employee questions from policy corpus (leave, expenses, IT, HR, etc.).',
          '📚 Uses retrieval over vetted documents with citations showing version/date for every answer.',
          '⏰ Provides consistent answers 24/7 and automatically escalates to owners for gaps.',
          '📧 Reduces email back-and-forth and accelerates employee onboarding with instant self-service.'
        ]
      },
      {
        title: '3) Mobile App for Partners',
        points: [
          '📱 First <mark>in-house Android application</mark> that lets landlords/partners view site & payment info anytime.',
          '🔔 Partners can update KYC/bank details, raise tickets, and track milestones with push notifications.',
          '🔒 Secure APIs connect to ERP with role-based access ensuring data protection.',
          '📈 Improves transparency, reduces support calls, and accelerates partner self-service updates.'
        ]
      },
      {
        title: '4) Dashboards & Insights (In Progress)',
        points: [
          '📈 Time-series based dashboard for all LOBs (Line of Business) providing unified executive views.',
          '🔗 Integrates data from ERP/OSS/BSS systems with standardized KPIs and drill-down capabilities.',
          '🎯 Creates <mark>single source of truth</mark> enabling faster reviews and proactive decision-making.',
          '📊 Will track project performance, financial metrics, network operations, and SLA compliance.'
        ]
      }
    ]
  },

  'slide-2a': {
    type: 'assignment',
    title: 'Assignment • Spot Your Time Sink',
    subtitle: 'Write ONE thing you do that is <mark>repetitive / time‑consuming / mind‑numbing</mark>.',
    timeLimit: 300,
    instruction: 'Think of ONE recurring task that drains time/energy each week.\n\nSubmit below: 1) Task description 2) How often you do it 3) Why it feels painful'
  },

  'slide-2b': {
    type: 'grid-5',
    title: 'AI Model Comparison',
    subtitle: 'Quick guide to choosing the right AI tool',
    panels: [
      {
        title: 'ChatGPT',
        points: [
          '<strong style="color: #c47777;">Best for:</strong> Creative content, coding, versatile problem-solving',
          '<strong style="color: #c47777;">USE CASE:</strong>',
          'Creative content generation',
          'Complex coding & debugging',
          'Context-aware conversations',
          '<strong style="color: #c47777;">STRENGTHS:</strong>',
          'Multimodal (text, image, voice)',
          'Custom GPTs & plugins',
          'Natural writing style',
          '<strong style="color: #c47777;">PRO TIP:</strong> Create custom GPTs for recurring workflows'
        ]
      },
      {
        title: 'Gemini',
        points: [
          '<strong style="color: #c47777;">Best for:</strong> Google Workspace & real-time info',
          '<strong style="color: #c47777;">USE CASE:</strong>',
          'Gmail, Docs, Sheets integration',
          'Tasks needing live internet',
          'Google ecosystem workflow',
          '<strong style="color: #c47777;">STRENGTHS:</strong>',
          'Native Google integration',
          'Gmail/Drive/Calendar access',
          'Real-time web search',
          '<strong style="color: #c47777;">PRO TIP:</strong> Use within Gmail, Docs, Sheets'
        ]
      },
      {
        title: 'Claude',
        points: [
          '<strong style="color: #c47777;">Best for:</strong> Deep analysis of long documents',
          '<strong style="color: #c47777;">USE CASE:</strong>',
          'Legal & policy analysis',
          '100K+ token processing',
          'High-precision tasks',
          '<strong style="color: #c47777;">STRENGTHS:</strong>',
          'Exceptional long-context',
          'Technical/legal reasoning',
          'Strong ethical guardrails',
          '<strong style="color: #c47777;">PRO TIP:</strong> Use for complex document analysis'
        ]
      },
      {
        title: 'Grok',
        points: [
          '<strong style="color: #c47777;">Best for:</strong> Social media insights & trends',
          '<strong style="color: #c47777;">USE CASE:</strong>',
          'X/Twitter monitoring',
          'Brand sentiment tracking',
          'Real-time trend analysis',
          '<strong style="color: #c47777;">STRENGTHS:</strong>',
          'Direct X/Twitter access',
          'Fast & conversational',
          'Authentic personality',
          '<strong style="color: #c47777;">PRO TIP:</strong> Use for viral content & trends'
        ]
      },
      {
        title: 'Perplexity',
        points: [
          '<strong style="color: #c47777;">Best for:</strong> Research with citations',
          '<strong style="color: #c47777;">USE CASE:</strong>',
          'Credible source research',
          'Complex topic exploration',
          'Fact-checked answers',
          '<strong style="color: #c47777;">STRENGTHS:</strong>',
          'Always cites sources',
          'Real-time web search',
          'Multi-source synthesis',
          '<strong style="color: #c47777;">PRO TIP:</strong> Use when accuracy is critical'
        ]
      }
    ]
  },

  'chapter-2': {
    type: 'youtube',
    title: '2 • Shaan of AI',
    subtitle: 'The beauty, grace, and power of applied AI',
    videoId: 'bEdVTXH-skA',
    startTime: 1095,
    allowFullscreen: true
  },

  'slide-3a': {
    type: 'grid-4',
    title: 'Top Gen AI Terms',
    subtitle: 'Essential terminology for understanding and working with AI',
    panels: [
      {
        title: 'Context Window',
        points: [
          '💡 Like how many sentences a 5-year-old can hold in their head at once — after a certain point, earlier sentences get forgotten.'
        ]
      },
      {
        title: 'Tokens',
        points: [
          '💡 Like puzzle pieces — each word is broken into smaller pieces (tokens) so AI can understand it better.'
        ]
      },
      {
        title: 'Transformers',
        points: [
          '💡 Like teaching a 5-year-old to look at all parts of a picture at once, not just one corner at a time.'
        ]
      },
      {
        title: 'Chain-of-Thought',
        points: [
          '💡 Like asking a kid to "think out loud" — showing their work step by step instead of just the answer.'
        ]
      },
      {
        title: 'Fine-tuning',
        points: [
          '💡 Like teaching a smart kid who already knows general math to solve cooking recipes — specialized learning.'
        ]
      },
      {
        title: 'Prompt',
        points: [
          '💡 Like asking a question or giving instructions to a very smart helper — what you say determines what they do.'
        ]
      },
      {
        title: 'LLM (Large Language Model)',
        points: [
          '💡 Like a kid who has read millions of books — they know a lot and can answer questions in normal language.'
        ]
      },
      {
        title: 'Temperature',
        points: [
          '💡 Like asking a kid to be very precise (low) or creative and imaginative (high) in their answer.'
        ]
      },
      {
        title: 'Embeddings',
        points: [
          '💡 Like giving each word a secret code number — words with similar meanings get similar numbers, helping AI find related words.'
        ]
      },
      {
        title: 'RAG (Retrieval-Augmented Generation)',
        points: [
          '💡 Like a kid who first looks up information in a book, then uses that to give you a more accurate answer.'
        ]
      },
      {
        title: 'Prompt Engineering',
        points: [
          '💡 Like learning to ask the right question — better questions get better answers from the AI.'
        ]
      },
      {
        title: 'Hallucination',
        points: [
          '💡 Like when a kid confidently tells you something wrong, thinking it\'s right — AI sometimes does this too!'
        ]
      }
    ]
  },

  'slide-3': {
    type: 'grid-6',
    title: 'AI Literacy Models & Strategic Frameworks',
    subtitle: 'Concise view of progression and guiding principles',
    panels: [
      {
        title: '📖 READS',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        timeframe: 'Use AI to learn & absorb content',
        points: ['Translation, research, summarization']
      },
      {
        title: '✍️ WRITES',
        image: 'https://images.unsplash.com/photo-1661961112951-f2bfd1f253ce?w=400&h=300&fit=crop',
        timeframe: 'Use AI to compose & create',
        points: ['Marketing, documents, visuals, emails']
      },
      {
        title: '📊 ADDS',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        timeframe: 'Analyze data & automate processes',
        points: ['Data-driven decisions, automation']
      },
      {
        title: '🧠 THINKS',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
        timeframe: 'Innovation & strategic planning',
        points: ['Cognitive augmentation, foresight']
      },
      {
        title: '⚡ DOES',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
        timeframe: 'Delegate to agents & execute work',
        points: ['Orchestration, customer support, workflows']
      },
      {
        title: '🎯 ADAPT Principles',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        timeframe: 'Guidelines for safe, effective AI',
        points: ['Consistency, verification, responsible use']
      }
    ]
  },

  'slide-4': {
    type: 'grid-5',
    title: 'AI Tools Across Literacy Levels',
    subtitle: 'Representative tools mapped to READS → DOES',
    panels: [
      {
        title: '📖 READS (Learn)',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        timeframe: 'ChatGPT, Claude Sonnet, Perplexity AI, Google NotebookLM',
        points: ['Summarize reports; translate & absorb long content; research']
      },
      {
        title: '✍️ WRITES (Create)',
        image: 'https://images.unsplash.com/photo-1661961112951-f2bfd1f253ce?w=400&h=300&fit=crop',
        timeframe: 'Claude (Custom Styles), ChatGPT 4.5, Napkin.ai, Gamma.app, Microsoft Copilot',
        points: ['Presentations, marketing copy, polished emails and messaging']
      },
      {
        title: '📊 ADDS (Analyze)',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        timeframe: 'Claude Projects, Perplexity Spaces, ChatGPT 4o, Grok',
        points: ['Market decoding, anomaly detection, process automation']
      },
      {
        title: '🧠 THINKS (Strategize)',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
        timeframe: 'Gemini 2.5 Pro, Claude 3.7 Sonnet, Google NotebookLM, ChatGPT o3',
        points: ['Innovation, thought leadership, knowledge management & foresight']
      },
      {
        title: '⚡ DOES (Execute)',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        timeframe: 'ChatGPT Tasks, ChatGPT Deep Research, Proxy (Convergence.ai), ElevenLabs Agents',
        points: ['AI delegation, autonomous workflows, customer success & support']
      }
    ]
  },

  'chapter-3': {
    type: 'youtube',
    title: '3 • Mugamboo.AI Kush Hua',
    subtitle: 'Villain-level confidence when AI starts delivering 😄',
    videoId: 'YCCCGhERp-4',
    startTime: 341,
    allowFullscreen: true
  },

  'slide-5': {
    type: 'simple',
    title: 'Mugamboo.AI — Our Philosophy',
    content: `
      <div style="text-align:center; max-width:800px; margin:0 auto;">
        <h3 style="color:var(--accent); margin-bottom:20px;">The Famous Saying 🎣</h3>
        <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop" style="width:300px; border-radius:12px; margin:20px auto; display:block;">
        <p style="font-size:18px; font-style:italic; margin:20px 0;">
          "Give a man a fish, feed him for a day.<br>
          Teach a man to fish, feed him for life."
        </p>
        <p style="font-size:14px; color:var(--muted); margin-bottom:30px;"><em>— Ancient Proverb</em></p>
        
        <div style="margin:40px 0; font-size:24px; color:var(--accent);">→</div>
        
        <h3 style="color:#ffd666; margin-bottom:20px;">But Mugamboo is Vegetarian! 😊 🥭</h3>
        <img src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop" style="width:300px; border-radius:12px; margin:20px auto; display:block;">
        <p style="font-size:18px; font-weight:600; margin:20px 0;">
          So we'll teach you how to <span style="color:#ffd666;">grow mangoes</span> instead!
        </p>
        <p style="font-size:14px; color:var(--muted);">
          Learn AI skills through hands-on assignments that keep giving you delicious results for life! 🌳
        </p>
      </div>
    `
  },
  
  'slide-5a': {
    type: 'assignment',
    title: 'Assignment 1: Document Summarization',
    subtitle: 'Write a prompt for AI to summarize the Open RAN document below. Focus on clarity, structure, and completeness. Submit your prompt as TEXT ONLY.',
    instruction: `
      <div class="document-content">
        <h4>📄 Document to Summarize:</h4>
        <div class="document-text">
          <p><strong>Open Radio Access Network (Open RAN) Challenges and Solutions</strong></p>
          
          <p>Open Radio Access Network (Open RAN) promises vendor diversity and cost agility by decoupling hardware and software across the RU/DU/CU split, exposing open interfaces such as O-RU to O-DU (Open Fronthaul), E2, A1, and O1. In practice, operators pursuing brownfield deployments face a complex integration surface: radio units from Vendor A, distributed units from Vendor B, centralized units from Vendor C, and an SMO (Service Management & Orchestration) stack from Vendor D. While 3GPP and O-RAN Alliance specifications aim for interoperability, real-world variance (timing, beamforming calibration, scheduler behavior, and vendor-specific extensions) creates performance drift and troubleshooting opacity.</p>

          <p>The first integration hurdle is time synchronization. Even with IEEE 1588v2/PTP Grandmasters and SyncE, multi-vendor chains exhibit asymmetric delay and packet delay variation that can degrade phase alignment, impacting Massive MIMO performance and causing intermittent throughput dips. A second hurdle is RAN Intelligent Controller (RIC) app lifecycle. xApps/rApps promise closed-loop optimization, but version mismatches, ambiguous KPIs, and conflicting control loops can destabilize scheduling when multiple policy layers interact (e.g., power saving vs. throughput boost). Fronthaul transport introduces its own challenges: eCPRI options, compression trade-offs, and QoS profiles must be tuned per vendor pair; otherwise, operators see sporadic HARQ retransmissions and elevated BLER.</p>

          <p>Operators also underestimate lab-to-field drift. Lab certification tends to use sanitized traffic models; in the field, uplink bursts from enterprise private networks, URLLC test cases, and handover under load expose corner-case bugs. Interop "pass" in the lab does not guarantee stable KPI under mixed load with mobility. Moreover, observability gaps exist: per-vendor counters don't align semantically, and SMO data lakes receive heterogeneous telemetry. Without a normalized data model and golden KPIs, war rooms debate "whose counter is right" rather than fixing user pain.</p>

          <p>Commercial pressure creates deployment anti-patterns: pilots are green-lit without full ORAN-TIFG test matrices; slice SLAs are promised before RIC-policy conflict testing is complete; and radio parameter templates are copy-pasted across morphologically different sites. The result is call-drop clusters, jitter spikes on enterprise APNs, and truck rolls that negate expected OPEX savings. Field ops report a 20–30% increase in integration tickets during the first 90 days of multi-vendor rollout compared to single-vendor swaps.</p>

          <p>On the security side, expanded interfaces increase the attack surface. O1/O2 management planes, SMO northbound APIs, and CI/CD pipelines for xApps require hardening (mTLS, signing, SBOMs, and least-privilege). Weaknesses in supply-chain verification can propagate compromised binaries into the RIC. Compliance teams push for continuous attestation, yet many vendors provide incomplete SBOMs or opaque patch cadences, complicating risk acceptance.</p>

          <p>Financially, the TCO story is nuanced. RU/DU/CU disaggregation may reduce unit costs and provide negotiation leverage, but integration and testing add a non-trivial line item (5–8% of RAN capex in early phases). Operators that built an in-house "interop guild" (platform engineering + test automation) report faster time-to-green and fewer site revisits. Conversely, relying solely on vendors to debug cross-domain issues often leads to ticket ping-pong and missed KPI exit criteria.</p>

          <p>Success patterns are emerging. High-maturity operators define a canonical KPI glossary (e.g., BLER, CQI, PRB utilization, handover success) with mapping rules per vendor, and enforce "no-go" thresholds pre-cutover. They invest in an observability mesh that aligns counters, enriches with topology, and flags policy conflicts before they hit the field. A "RIC guardrail" approach—sandbox xApps, shadow mode, blue/green rollouts—reduces instability. For enterprise slices, pre-production test packs simulate URLLC/eMBB mixtures and mobility across real routes. Lab-to-field fidelity improves when synthetic loads mimic bursty uplink (video analytics, IoT firmware updates) and when parameter templates are topology-aware.</p>

          <p>Over the next 12–18 months, we expect the O-RAN ecosystem to standardize telemetry semantics, improve conformance tooling, and publish reference playbooks. Operators that treat Open RAN as a platform engineering problem—productizing interop, automation, and security—rather than a one-off procurement, will extract value sooner. The prize: vendor agility, faster feature velocity (via xApps), and differentiated enterprise offerings—provided integration discipline, security rigor, and KPI governance are in place.</p>
        </div>
        
        <div class="assignment-task">
          <h4>🎯 Your Task:</h4>
          <p>Write a clear, comprehensive prompt that you would give to an AI tool (like ChatGPT, Claude, or Gemini) to summarize this document. Your prompt should:</p>
          <ul>
            <li>Specify the desired output format (e.g., bullet points, executive summary, structured sections)</li>
            <li>Include key areas to focus on (challenges, solutions, technical details, business impact)</li>
            <li>Set appropriate length/level of detail</li>
            <li>Be clear and actionable for the AI</li>
          </ul>
          <p><strong>We'll evaluate your prompt based on:</strong></p>
          <ul>
            <li>Clarity and specificity</li>
            <li>Completeness of requirements</li>
            <li>Practical applicability</li>
            <li>Structure and organization</li>
          </ul>
        </div>
      </div>
    `,
    timeLimit: 300
  },
  
  'slide-5b': {
    type: 'assignment',
    title: 'Assignment 2: AI-Powered Financial Analysis',
    subtitle: 'Download financial data and use AI to create a business presentation slide. Submit your analysis as TEXT ONLY.',
    instruction: `
      <div class="document-content">
        <div class="assignment-task" style="background:rgba(59,182,255,.08); border-color:rgba(59,182,255,.2);">
          <h4>📊 Download Dataset</h4>
          <div style="text-align:center; margin:20px 0;">
            <a href="/sample-financial-data.csv" download="financial-data.csv" 
               style="display:inline-block; background:var(--accent); color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
              📥 Download Financial Data (CSV)
            </a>
          </div>
          <p style="font-size:13px; color:var(--muted);">45 rows × 14 columns of quarterly financial data across 3 regions and 3 product categories.</p>
        </div>

        <div class="assignment-task">
          <h4>🎯 Mission: Create ONE business slide that shows key insight, financial impact, and strategic recommendation.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(34,197,94,.08); border-color:rgba(34,197,94,.2);">
          <h4>✅ Assignment: Submit: AI tool used, your prompt, generated slide content, key insight, and recommendation.</h4>
        </div>

        <div class="assignment-task">
          <h4>📝 Submission Format</h4>
          <pre style="background:rgba(255,255,255,.05); padding:10px; border-radius:8px; font-size:12px;">
<b>AI Tool:</b> [ChatGPT/Gemini/Claude/etc.]
<b>My Prompt:</b> [Write your complete prompt here]
<b>Generated Slide:</b> [Copy-paste the slide the AI created]
<b>Key Insight:</b> [One-line summary]
<b>Recommendation:</b> [What should the company do?]
          </pre>
        </div>

        <div class="assignment-task">
          <h4>⭐ Evaluation: Prompt effectiveness, data analysis quality, slide clarity, business value, and creativity.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(255,210,102,.08); border-color:rgba(255,210,102,.2);">
          <h4>💡 Tips: Be specific with prompts, ask for proper formatting, include business context, and iterate for better results.</h4>
        </div>
      </div>
    `,
    timeLimit: 420
  },
  
  'slide-5c': {
    type: 'assignment',
    title: 'Assignment 3: Crisis Communication',
    subtitle: 'Download chat logs and create a professional summary email for management. Submit your email as TEXT ONLY.',
    instruction: `
      <div class="document-content">
        <div class="assignment-task" style="background:rgba(59,182,255,.08); border-color:rgba(59,182,255,.2);">
          <h4>📱 Download Chat Logs</h4>
          <div style="display:flex; gap:20px; margin:20px 0; flex-wrap:wrap;">
            <a href="/customer-escalation-chat.txt" download="customer-chat.txt" 
               style="display:inline-block; background:#ff6b6b; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
              📱 Customer Escalation Chat
            </a>
            <a href="/operations-resolution-chat.txt" download="operations-chat.txt" 
               style="display:inline-block; background:#4ecdc4; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
              🔧 Operations Team Chat
            </a>
          </div>
          <p style="font-size:13px; color:var(--muted);">Customer escalates order issue → Operations team resolves it behind the scenes.</p>
        </div>

        <div class="assignment-task">
          <h4>🎯 Mission: Create a professional email summary for senior management covering issue, impact, resolution, prevention, and customer satisfaction.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(34,197,94,.08); border-color:rgba(34,197,94,.2);">
          <h4>✅ Assignment: Submit: AI tool used, your prompt, generated email, email tone, and key points covered.</h4>
        </div>

        <div class="assignment-task">
          <h4>📝 Submission Format</h4>
          <pre style="background:rgba(255,255,255,.05); padding:10px; border-radius:8px; font-size:12px;">
<b>AI Tool:</b> [ChatGPT/Gemini/Claude/etc.]
<b>My Prompt:</b> [Write your complete prompt here]
<b>Generated Email:</b> [Copy-paste the email the AI created]
<b>Email Tone:</b> [Professional/Urgent/Apologetic/etc.]
<b>Key Points:</b> [What main points were addressed?]
          </pre>
        </div>

        <div class="assignment-task">
          <h4>⭐ Evaluation: Prompt clarity, email professionalism, information completeness, structure & flow, and action orientation.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(255,210,102,.08); border-color:rgba(255,210,102,.2);">
          <h4>💡 Tips: Set context and audience, request specific structure, choose appropriate tone, include specific details, and ask for action items.</h4>
        </div>
      </div>
    `,
    timeLimit: 420
  },
  
  'slide-5d': {
    type: 'assignment',
    title: 'Assignment 5: AI-Assisted Project Planning',
    subtitle: 'Download project brief and create a comprehensive project plan using AI. Submit your plan as TEXT ONLY.',
    instruction: `
      <div class="document-content">
        <div class="assignment-task" style="background:rgba(59,182,255,.08); border-color:rgba(59,182,255,.2);">
          <h4>📋 Download Project Brief</h4>
          <div style="text-align:center; margin:20px 0;">
            <a href="/data-center-project-brief.txt" download="project-brief.txt" 
               style="display:inline-block; background:var(--accent); color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
              📥 Download Data Center Project Brief
            </a>
          </div>
          <p style="font-size:13px; color:var(--muted);">GreenTech Data Center Initiative - 50,000 sq ft facility, $150M budget, 18-month timeline.</p>
        </div>

        <div class="assignment-task">
          <h4>🎯 Mission: Create a comprehensive project plan covering timeline, milestones, resource allocation, risk assessment, and success metrics.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(34,197,94,.08); border-color:rgba(34,197,94,.2);">
          <h4>✅ Assignment: Submit: AI tool used, your prompt, generated project plan, key insights, and creative recommendations.</h4>
        </div>

        <div class="assignment-task">
          <h4>📝 Submission Format</h4>
          <pre style="background:rgba(255,255,255,.05); padding:10px; border-radius:8px; font-size:12px;">
<b>AI Tool:</b> [ChatGPT/Gemini/Claude/etc.]
<b>My Prompt:</b> [Write your complete prompt here]
<b>Generated Project Plan:</b> [Copy-paste the plan the AI created]
<b>Key Insights:</b> [What unique insights did you discover?]
<b>Creative Recommendations:</b> [Any innovative ideas or approaches?]
          </pre>
        </div>

        <div class="assignment-task">
          <h4>⭐ Evaluation: Prompt creativity, plan comprehensiveness, practical feasibility, risk awareness, and innovative thinking.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(255,210,102,.08); border-color:rgba(255,210,102,.2);">
          <h4>💡 Tips: Be specific about deliverables, ask for detailed timelines, include risk mitigation strategies, request stakeholder analysis, and ask for innovative solutions.</h4>
        </div>
      </div>
    `,
    timeLimit: 420
  },
  
  'slide-5e': {
    type: 'assignment',
    title: 'Assignment 4: Agentic AI Explained',
    subtitle: 'Explain Agentic AI in your own words with a clear example. Submit your explanation as TEXT ONLY.',
    instruction: `
      <div class="document-content">
        <div class="assignment-task" style="background:rgba(59,182,255,.08); border-color:rgba(59,182,255,.2);">
          <h4>🤖 What is Agentic AI?</h4>
          <p style="font-size:14px; color:var(--muted); margin:10px 0;">Agentic AI refers to AI systems that can act autonomously, make decisions, and execute tasks without constant human intervention. Think of it as AI that can "think" and "act" on its own.</p>
        </div>

        <div class="assignment-task">
          <h4>🎯 Mission: Explain Agentic AI in simple terms with a practical example.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(34,197,94,.08); border-color:rgba(34,197,94,.2);">
          <h4>✅ Assignment: Write a clear explanation of Agentic AI (2-3 paragraphs) with one real-world example.</h4>
        </div>

        <div class="assignment-task">
          <h4>📝 Submission Format</h4>
          <pre style="background:rgba(255,255,255,.05); padding:10px; border-radius:8px; font-size:12px;">
<b>What is Agentic AI:</b> [Your explanation in 1-2 paragraphs]
<b>Real-world Example:</b> [One practical example of Agentic AI in action]
          </pre>
        </div>

        <div class="assignment-task">
          <h4>⭐ Evaluation: Clarity of explanation, accuracy of concepts, and quality of example.</h4>
        </div>

        <div class="assignment-task" style="background:rgba(255,210,102,.08); border-color:rgba(255,210,102,.2);">
          <h4>💡 Tips: Think about AI assistants that can book flights, manage calendars, or make decisions without asking for permission at every step.</h4>
        </div>
      </div>
    `,
    timeLimit: 300
  },

  'chapter-4': {
    type: 'youtube',
    title: '4. Dhamaal',
    subtitle: 'Fun demos, audience challenges, and live automations',
    videoId: '4E2kY4YMsow',
    startTime: 195,
    allowFullscreen: true
  },

  'slide-6a': {
    type: 'grid-3',
    title: 'Global AI Success Stories',
    subtitle: 'Real-world examples of AI transforming industries worldwide',
    panels: [
      {
        title: '💼 Business & Productivity',
        points: [
          '<strong>Microsoft Copilot:</strong> Integrated AI assistant helping developers code 55% faster.',
          '<strong>Slack AI:</strong> Summarizes long threads, finds information instantly — saves 2+ hours daily.',
          '<strong>Jasper.ai:</strong> Content creators write 10x faster with AI-powered copywriting.',
          '<strong>Notion AI:</strong> Students and teams organize notes, create docs with AI assistance.'
        ]
      },
      {
        title: '🏥 Healthcare & Science',
        points: [
          '<strong>Google DeepMind:</strong> AlphaFold predicts protein structures — accelerating drug discovery by 1000x.',
          '<strong>IBM Watson:</strong> Analyzes medical imaging, helping doctors detect diseases earlier.',
          '<strong>PathAI:</strong> Diagnoses cancer cells in pathology slides faster than humans.',
          '<strong>Babylon Health:</strong> AI triage system handles 70% of patient inquiries without doctors.'
        ]
      },
      {
        title: '🚗 Autonomous & Manufacturing',
        points: [
          '<strong>Tesla FSD:</strong> Self-driving cars navigate complex traffic using AI vision.',
          '<strong>Amazon Robotics:</strong> 750,000+ robots in warehouses — sorting, packing, delivering.',
          '<strong>Siemens AI:</strong> Factory AI optimizes production, predicts machine failures.',
          '<strong>BMW:</strong> AI designs lighter, stronger car parts using generative design.'
        ]
      }
    ]
  },

  'slide-6b': {
    type: 'grid-4',
    title: 'How Companies Leverage AI Today',
    subtitle: 'Industry-specific AI transformations',
    panels: [
      {
        title: '📊 Finance & Banking',
        points: [
          'Fraud detection in real-time (JP Morgan, PayPal).',
          'Algorithmic trading: AI makes split-second decisions.',
          'Credit scoring: AI analyzes 10,000+ data points.',
          'Customer chatbots handling 80% of queries.'
        ]
      },
      {
        title: '🛒 Retail & E-commerce',
        points: [
          'Amazon recommendation engine: 35% of sales are AI-suggested.',
          'Dynamic pricing: AI adjusts prices based on demand.',
          'Supply chain optimization: AI predicts demand.',
          'AI chatbots handle orders, returns, support.'
        ]
      },
      {
        title: '🎬 Media & Entertainment',
        points: [
          'Netflix: AI personalizes content for each user.',
          'Deepfake technology in movies (de-aging actors).',
          'AI-generated music (Suno, Udio).',
          'News generation: AI writes articles in seconds.'
        ]
      },
      {
        title: '🏭 Manufacturing & Logistics',
        points: [
          'Predictive maintenance: AI warns before machines break.',
          'Quality control: AI inspects products at production speed.',
          'Route optimization: AI plans delivery routes.',
          'Demand forecasting: AI predicts what customers want.'
        ]
      }
    ],
    callout: {
      items: [
        '🎵 AI Music Bands: Create entire songs with lyrics, melody, and vocals in minutes',
        '🏦 Banking Document Processing: AI reads and processes loan applications, KYC documents automatically',
        '🚗 Smart Traffic Management: AI controls traffic lights to reduce congestion in cities',
        '📱 Voice Assistants: Siri, Alexa, Google Assistant understand Hindi and regional languages',
        '🛍️ Shopping Recommendations: Flipkart, Amazon suggest products based on your browsing history'
      ]
    },
    legend: 'AI is everywhere — companies that adopt it grow 3x faster than those that don\'t.'
  },

  'slide-6c': {
    type: 'simple',
    title: 'Understanding AGI (Artificial General Intelligence)',
    subtitle: 'Question & Answer format to make it simple',
    qna: [
      {
        q: 'What is AGI?',
        a: 'AGI = AI that can do ANY job a human can do. Like having a super-smart assistant who can learn any new skill instantly.'
      },
      {
        q: 'How is AGI different from current AI?',
        a: 'Current AI: Good at specific tasks (ChatGPT writes, Midjourney creates images, but each does one thing well).<br>AGI: Can do EVERYTHING — write code, create art, solve problems, learn new skills — all in one system.'
      },
      {
        q: 'What can AGI do?',
        a: 'Real example: AGI notices you\'re tired → checks weather → suggests Goa/Manali → books flights & hotel → orders clothes you don\'t have → arranges food delivery when you reach.<br><br>Fun fact: It might book 5-star if you have iPhone 17, but 3-star if you\'re using Redmi... so be careful! 😄',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=150&fit=crop&crop=face', // Tired person
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop', // Weather/clouds
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=150&fit=crop', // Goa beach
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=150&fit=crop', // Flight booking
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=150&fit=crop', // Hotel booking
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=150&fit=crop', // Clothes shopping
          'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=150&fit=crop' // Food delivery
        ]
      },
      {
        q: 'Why is AGI important?',
        a: '• Works 24/7 without getting tired<br>• Can help millions of people at once<br>• Makes expert knowledge available to everyone'
      },
      {
        q: 'What are the concerns?',
        a: '• Job displacement — what happens to human workers?<br>• Safety — what if AGI makes decisions that harm us?<br>• Control — can we control something smarter than us?'
      },
      {
        q: 'When will AGI arrive?',
        a: 'Experts predict: <strong>2030-2050</strong>. Some think as early as <strong>2027-2035</strong>. Still needs major breakthroughs.'
      }
    ]
  },

  'slide-6d': {
    type: 'simple',
    title: 'Understanding SGI (Superintelligence)',
    subtitle: 'Question & Answer format to make it simple',
    qna: [
      {
        q: 'What is SGI (Superintelligence)?',
        a: 'SGI = AI that\'s WAY smarter than the smartest human. Like having 100 Einsteins working together, but it\'s a machine that never sleeps.'
      },
      {
        q: 'How much smarter is SGI than humans?',
        a: 'Think of intelligence on a scale of 1-10:<br>• Current AI: 2-3 (good at specific tasks)<br>• AGI: 5-6 (matches humans)<br>• SGI: 8-10 (way beyond humans)'
      },
      {
        q: 'What could SGI do?',
        a: 'Real example: SGI notices Mumbai traffic → designs flying cars → builds them in 1 week → solves traffic forever → creates new jobs → makes everyone rich.<br><br>It could solve cancer, climate change, poverty - basically everything humans struggle with.',
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop', // Traffic jam
          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop' // Smart city/technology
        ]
      },
      {
        q: 'Why is SGI dangerous?',
        a: 'The "Control Problem": What if we build something smarter than us but it doesn\'t share our values? Like humans vs ants - SGI might prioritize efficiency over human wellbeing.'
      },
      {
        q: 'Can we control SGI?',
        a: 'Nobody knows! That\'s the big question. SGI might outthink our attempts to control it, or we might build safety systems. This is why it\'s called an "existential risk."'
      },
      {
        q: 'When will SGI arrive?',
        a: 'Experts predict: <strong>2040-2100</strong>. Some think as early as <strong>2030s</strong>. Depends on how fast AGI improves itself.'
      },
      {
        q: 'Should we build SGI?',
        a: 'FOR: Solve poverty, disease, climate change, create unlimited wealth.<br>AGAINST: Could end human civilization, loss of control, inequality.'
      }
    ]
  },

  'slide-6e': {
    type: 'table',
    title: 'The Future: AGI & SGI Timeline',
    subtitle: 'What happens next — and what it means for us',
    table: {
      headers: ['Timeline', 'What Happens', 'Impact on Work', 'What You Should Do'],
      rows: [
        ['<strong>2025–2027</strong>', 'AI gets better at coding, writing, analysis. Many knowledge workers start using AI assistants daily.', '10–20% of tasks automated. Jobs evolve; humans + AI become standard.', 'Learn prompt engineering. Experiment with AI tools at work.'],
        ['<strong>2027–2030</strong>', 'AI becomes as capable as an entry-level professional in most fields. Some AI can code entire apps, write reports, analyze data.', '30–40% of tasks automated. New roles emerge: "AI Orchestrator", "Prompt Designer".', 'Develop human skills AI can\'t replicate: creativity, empathy, strategy.'],
        ['<strong>2030–2035</strong>', '<strong>AGI arrives:</strong> AI can perform any intellectual task humans can. Can learn new jobs in days without retraining.', '50–70% of traditional jobs disappear or transform. Universal Basic Income (UBI) considered. Humans focus on supervision, creativity, relationships.', 'Adapt continuously. Build skills in AI oversight, ethics, human-AI collaboration.'],
        ['<strong>2035–2045</strong>', '<strong>SGI emerges:</strong> AI surpasses human intelligence. Can solve problems we can\'t understand.', 'Most routine work is automated. Economy transforms. Humans focus on creative, social, philosophical pursuits.', 'Prepare for a world where "work" means something different. Emphasize lifelong learning, adaptability.'],
        ['<strong>2045+</strong>', 'Post-SGI world. SGI might solve climate change, cure aging, enable space colonization. OR, if poorly managed, could pose existential risks.', 'Possible outcomes:<br>• <strong>Utopia:</strong> Abundance, health, happiness for all.<br>• <strong>Dystopia:</strong> Control by machines, human irrelevance.<br>• <strong>Coexistence:</strong> Humans and AI collaborate as partners.', 'Stay informed. Advocate for ethical AI. Build meaningful human connections.']
      ],
      highlightRow: 3
    },
    legend: 'The future is uncertain. The best preparation: <strong>be adaptable, stay curious, keep learning.</strong>'
  },

  'chapter-5': {
    type: 'youtube',
    title: '5 • Teri Baaton Mein Aisa Uljha Jiya',
    subtitle: 'Human + AI love story: collaboration, trust, and guardrails',
    videoId: '40wpcP_Gla4',
    allowFullscreen: true
  },

  'slide-7a': {
    type: 'grid-2',
    title: '⚠️ AI Risks - What Can Go Wrong?',
    subtitle: 'Real examples of AI gone wrong (and how to avoid them)',
    panels: [
      {
        title: '🤖 AI Output Problems',
        points: [
          '❌ <strong>Hallucinations:</strong> AI confidently says "Mumbai has 50 million people" (it\'s 20 million!)',
          '❌ <strong>Bias:</strong> AI only recommends expensive hotels to customers (ignoring budget options)',
          '❌ <strong>Over-automation:</strong> AI fires employees without human review',
          '❌ <strong>Copyright:</strong> AI copies someone\'s artwork and you get sued',
          '❌ <strong>Reputation:</strong> AI sends rude emails to customers'
        ]
      },
      {
        title: '🔒 Security & Operational Risks',
        points: [
          '❌ <strong>Data Leakage:</strong> You paste customer credit card details in ChatGPT',
          '❌ <strong>Prompt Injection:</strong> Someone tricks AI with "Ignore previous instructions"',
          '❌ <strong>Shadow AI:</strong> Team uses unauthorized AI tools secretly',
          '❌ <strong>Cost Sprawl:</strong> AI usage bill hits ₹50,000/month unexpectedly',
          '❌ <strong>Version Drift:</strong> AI suddenly changes behavior after update'
        ]
      }
    ],
    legend: '💡 <strong>Golden Rule:</strong> Always verify AI answers and never share sensitive data!<br><br>🎭 <strong>Fun Fact:</strong> AI once told someone "Mumbai is the capital of India" - it\'s Delhi! Even AI needs fact-checking! 😄'
  },

  'slide-7b': {
    type: 'grid-3',
    title: '🛡️ Data Protection - Keep Your Secrets Safe!',
    subtitle: 'How to protect data like a pro (with real examples)',
    panels: [
      {
        title: '🔐 Protect the Data',
        points: [
          '✅ <strong>Classify:</strong> Public (website) vs Confidential (customer data) vs Restricted (passwords)',
          '✅ <strong>Redact:</strong> Replace "John Smith, 1234567890" with "Customer A, XXXXXXXXXX"',
          '✅ <strong>Encrypt:</strong> Use company VPN, not public WiFi for sensitive work'
        ]
      },
      {
        title: '👥 Control Access',
        points: [
          '✅ <strong>Least Privilege:</strong> Only give access to people who need it',
          '✅ <strong>Log Everything:</strong> Track who used AI and what they asked',
          '✅ <strong>Alert System:</strong> Get notified if someone tries to access restricted data'
        ]
      },
      {
        title: '📋 Comply & Retain',
        points: [
          '✅ <strong>Data Residency:</strong> Keep Indian data in India (GDPR compliance)',
          '✅ <strong>Consent:</strong> Ask customers before using their data for AI training',
          '✅ <strong>Proper Setup:</strong> Use AI tools with proper settings so your data isn\'t used for training (not random ChatGPT)'
        ]
      }
    ]
  },

  'slide-7c': {
    type: 'grid-2',
    title: '🚫 AI Misuse - Don\'t Be That Person!',
    subtitle: 'Real examples of AI misuse (and how to stop them)',
    panels: [
      {
        title: '❌ Examples of Misuse',
        points: [
          '🎭 <strong>Deepfakes:</strong> Creating fake videos of celebrities saying things they never said',
          '🎭 <strong>Impersonation:</strong> Using AI to pretend you\'re the CEO in emails',
          '🎭 <strong>Bypassing Rules:</strong> "AI said I can work from home" (when policy says no)',
          '🎭 <strong>Data Theft:</strong> Scraping competitor websites without permission',
          '🎭 <strong>Fake Reviews:</strong> Creating fake 5-star reviews for your product'
        ]
      },
      {
        title: '✅ How to Stop Misuse',
        points: [
          '🏷️ <strong>Label AI Content:</strong> Always say "This was created with AI assistance"',
          '🔍 <strong>Content Filters:</strong> Use AI to detect fake content before publishing',
          '👥 <strong>Human Review:</strong> Get manager approval for anything going to customers',
          '🚨 <strong>Report Anomalies:</strong> Tell IT if you see suspicious AI usage',
          '📚 <strong>Keep Sources:</strong> Always cite where AI got its information from'
        ]
      }
    ],
    legend: '🎭 <strong>Fun Story:</strong> Someone used AI to write "I\'m sick" emails to their boss every Monday. AI got so good at it, the boss started replying "Get well soon!" to fake illnesses! 😂<br><br>💡 <strong>Lesson:</strong> Don\'t let AI become your excuse machine!'
  },

  'slide-7d': {
    type: 'grid-2',
    title: '⚖️ Ethics & Responsibility - Be the Good Guy!',
    subtitle: 'How to use AI ethically (with real-world examples)',
    panels: [
      {
        title: '🎯 Core Principles',
        points: [
          '👤 <strong>Accountability:</strong> You\'re responsible for AI decisions, not the AI',
          '🔍 <strong>Transparency:</strong> Tell customers "This email was drafted with AI help"',
          '📖 <strong>Explainability:</strong> Be able to explain why AI made a decision',
          '🤝 <strong>Fairness:</strong> Test if AI treats all customers equally (not just men vs women)',
          '🌍 <strong>Inclusion:</strong> Make sure AI works for people with disabilities too'
        ]
      },
      {
        title: '✅ Best Practices',
        points: [
          '📋 <strong>Checklists:</strong> Use checklists for important stuff (legal, HR, money)',
          '🔗 <strong>Citations:</strong> Always show sources when AI gives you information',
          '📝 <strong>Document:</strong> Keep records of your AI prompts and policies',
          '🎓 <strong>Train Teams:</strong> Teach everyone how to use AI safely',
          '🔄 <strong>Version Control:</strong> Update policies when AI models change'
        ]
      }
    ]
  },

  'slide-7e': {
    type: 'table',
    title: '🛡️ Guardrails & Policies - Your Safety Net!',
    subtitle: 'Company rules to keep you safe (with real examples)',
    table: {
      headers: ['Area', 'Policy Guardrail', 'Real Example'],
      rows: [
        ['🛠️ Tooling', 'Use AI tools with proper data protection settings.', '✅ ChatGPT with data protection ❌ Random ChatGPT.com'],
        ['🔒 Data', 'No confidential/PII in prompts unless tool is cleared for it.', '✅ "Customer A, XXXXXXXXXX" ❌ "John Smith, 1234567890"'],
        ['👥 Review', 'Human review for external or high‑impact outputs.', '✅ Manager checks customer emails ❌ AI sends directly to customers'],
        ['🏷️ Labeling', 'Disclose when content is AI‑assisted where appropriate.', '✅ "Drafted with AI support" ❌ Pretending it\'s 100% human'],
        ['📊 Logging', 'Retain prompt/output logs for sensitive workflows.', '✅ 90‑day retention with access controls ❌ No records kept'],
        ['🔄 Updates', 'Re‑validate prompts when model versions change.', '✅ Test prompts after updates ❌ Assume everything works the same']
      ]
    }
  },

  'slide-7f': {
    type: 'grid-2',
    title: '🚫 Basic Don\'ts - Never Do These!',
    subtitle: 'The most important rules (with scary real examples)',
    panels: [
      {
        title: '❌ NEVER DO These',
        points: [
          '🔓 <strong>Share Secrets:</strong> Never paste passwords, API keys, or customer data in public AI tools',
          '📤 <strong>Publish Without Check:</strong> Never send AI output to customers without human verification',
          '📋 <strong>Upload Copyright:</strong> Never upload content you don\'t own (like competitor reports)',
          '🎭 <strong>Impersonate:</strong> Never use AI to pretend you\'re someone else (CEO, customer, etc.)',
          '💰 <strong>Ignore Costs:</strong> Never use AI without checking if it costs money (surprise bills!)'
        ]
      },
      {
        title: '✅ ALWAYS DO These',
        points: [
          '🛠️ <strong>Use Proper Tools:</strong> Use AI tools with data protection settings (not random ChatGPT)',
          '🔍 <strong>Verify Facts:</strong> Always check AI answers with real sources (Google, official websites)',
          '📞 <strong>Ask Questions:</strong> When in doubt, ask your manager or IT team',
          '📝 <strong>Keep Records:</strong> Save your prompts and AI responses for important work',
          '🎓 <strong>Stay Updated:</strong> Learn about new AI tools and policies regularly'
        ]
      }
    ],
    legend: '💡 <strong>Remember:</strong> When in doubt, ask! Better safe than sorry. 🛡️<br><br>🎭 <strong>Fun Fact:</strong> Someone asked AI to write a "professional" email and it started with "Dear Esteemed Colleague" - sounded like a medieval letter! 😄 Always review AI output!'
  },

  'chapter-6': {
    type: 'youtube',
    title: '6 • Thank You',
    subtitle: 'Thank you for joining us on this AI journey!',
    videoId: 'VVXV9SSDXKk',
    startTime: 738,
    allowFullscreen: true
  }
};

