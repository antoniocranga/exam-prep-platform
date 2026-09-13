import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ModuleRow, LessonRow, LessonBlockRow } from "@/types/database.types";

export interface MockExamVariant {
  id: string;
  slug: string;
  title: string;
  exam_type: "definitivat" | "titularizare" | "concurs_director";
  badge_label: string;
  duration_minutes: number;
  total_points: number;
  oficiu_points: number;
  block_count: number;
  description: string;
}

export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index?: number;
  correct_option_id?: string;
  explanation?: string;
  citation?: string;
}

export interface OpenQuestion {
  title?: string;
  question: string;
  rubric_criteria: string[];
  sample_answer: string;
  citation?: string;
}

export interface MockExamStructure {
  id: string;
  slug: string;
  title: string;
  exam_type: "definitivat" | "titularizare" | "concurs_director";
  badge_label: string;
  duration_minutes: number;
  total_points: number;
  oficiu_points: number;
  cover_markdown: string;
  instructions_callout?: { title: string; content: string; variant?: string };
  subiectul_1: {
    title: string;
    points: number;
    description: string;
    questions: McqQuestion[];
  };
  subiectul_2: {
    title: string;
    points: number;
    question: string;
    rubric_criteria: string[];
    sample_answer: string;
    citation?: string;
  };
  subiectul_3: {
    title: string;
    points: number;
    question: string;
    rubric_criteria: string[];
    sample_answer: string;
    citation?: string;
  };
  references?: Array<{ locator: string; citation: string; source_url?: string }>;
}

async function getSupabase() {
  try {
    return await createServerClient();
  } catch {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
}

// Default questions for Titularizare (Subiectul I)
const TITULARIZARE_DEFAULT_MCQS: McqQuestion[] = [
  {
    id: "tit_q1",
    question: "1. Ce reprezintă curriculumul național conform art. 85 din Legea 198/2023?",
    options: [
      "A) Ansamblul manualelor școlare aprobate de minister",
      "B) Ansamblul coerent al planurilor-cadru de învățământ și al programelor școlare din învățământul preuniversitar",
      "C) Totalitatea activităților extrașcolare desfășurate de profesori",
      "D) Numai disciplinele obligatorii prevăzute la examenele naționale",
    ],
    correct_option_index: 1,
    explanation: "Curriculumul național reprezintă ansamblul coerent al planurilor-cadru de învățământ și al programelor școlare din învățământul preuniversitar.",
    citation: "Legea 198/2023, Art. 85",
  },
  {
    id: "tit_q2",
    question: "2. Care dintre următoarele este o competență-cheie europeană integrată în profilul de formare al absolventului?",
    options: [
      "A) Competența de memorare rapidă a formulelor",
      "B) Competența multilingvistică și competența digitală",
      "C) Abilitatea de a promova examene fără contestații",
      "D) Disciplina exclusiv teoretică",
    ],
    correct_option_index: 1,
    explanation: "Recomandarea Consiliului UE din 2018 și Profilul de formare includ competența multilingvistică și competența digitală printre cele 8 competențe-cheie.",
    citation: "Profilul de formare al absolventului / Recomandarea Consiliului UE 2018",
  },
  {
    id: "tit_q3",
    question: "3. În taxonomia lui Bloom revizuită (Anderson & Krathwohl), care este cel mai înalt nivel cognitiv?",
    options: ["A) Analiza", "B) Evaluarea", "C) Crearea (Sinteza generativă)", "D) Aplicarea"],
    correct_option_index: 2,
    explanation: "În taxonomia revizuită, nivelul cel mai înalt este 'Crearea' (Creating), urmat de 'Evaluare' (Evaluating).",
    citation: "Anderson & Krathwohl (2001), A Taxonomy for Learning, Teaching, and Assessing",
  },
  {
    id: "tit_q4",
    question: "4. Ce mărime a efectului (effect size d) atribuie John Hattie feedback-ului didactic orientat spre sarcină?",
    options: ["A) d = 0.15", "B) d = 0.35", "C) d = 0.75", "D) d = 1.80"],
    correct_option_index: 2,
    explanation: "Feedback-ul de calitate are o mărime a efectului de d = 0.75, depășind cu mult pragul de hinge-point de 0.40.",
    citation: "Hattie, J. (2009). Visible Learning, cap. 9 — Feedback",
  },
  {
    id: "tit_q5",
    question: "5. În proiectarea unei unități de învățare, punctul de plecare îl constituie:",
    options: [
      "A) Numărul de pagini din manual",
      "B) Competențele specifice derivate din programa școlară",
      "C) Preferințele elevilor pentru teme",
      "D) Orarul stabilit de conducerea școlii",
    ],
    correct_option_index: 1,
    explanation: "Proiectarea didactică centrată pe competențe pornește obligatoriu de la competențele specifice urmărite.",
    citation: "Metodologia proiectării didactice centrate pe competențe",
  },
  {
    id: "tit_q6",
    question: "6. Ce presupune adaptarea curriculară pentru un elev cu CES inclus în învățământul de masă?",
    options: [
      "A) Excluderea elevului de la orele dificile",
      "B) Elaborarea unui Plan de Intervenție Personalizat (PIP) și ajustarea ritmului și sarcinilor",
      "C) Trecerea automată a notelor maxime fără evaluare",
      "D) Doar asistență medicală",
    ],
    correct_option_index: 1,
    explanation: "Conform art. 65 din Legea 198/2023, elevii cu CES beneficiază de Plan de Intervenție Personalizat (PIP) și profesor de sprijin.",
    citation: "Legea 198/2023, Art. 65",
  },
  {
    id: "tit_q7",
    question: "7. Care este funcția principală a evaluării inițiale (diagnostice)?",
    options: [
      "A) Stabilirea mediilor din catalog",
      "B) Ierarhizarea definitivă a elevilor la începutul anului",
      "C) Identificarea nivelului achizițiilor prealabile pentru reglarea intervenției didactice",
      "D) Sancționarea elevilor care nu au repetat în vacanță",
    ],
    correct_option_index: 2,
    explanation: "Evaluarea inițială are rol de diagnoză și prognoză, oferind profesorului baza pentru planificarea diferențiată.",
    citation: "Ghid de evaluare didactică, MEN",
  },
  {
    id: "tit_q8",
    question: "8. Ce tip de item de evaluare permite măsurarea gândirii critice și a capacității de sinteză argumentativă?",
    options: ["A) Itemul cu alegere duală", "B) Itemul de tip pereche", "C) Itemul de tip eseu structurat / semistructurat", "D) Itemul cu alegere multiplă simplă"],
    correct_option_index: 2,
    explanation: "Itemii subiectivi (eseu structurat/semistructurat) măsoară abilitățile cognitive superioare, argumentarea și transferul de cunoștințe.",
    citation: "Teoria evaluării educaționale",
  },
  {
    id: "tit_q9",
    question: "9. Conform Codului-cadru de etică al personalului didactic, profesorului îi este interzis:",
    options: [
      "A) Să utilizeze mijloace digitale la clasă",
      "B) Să acorde meditații contra cost elevilor de la clasele la care este încadrat",
      "C) Să participe la cursuri de formare continuă în weekend",
      "D) Să organizeze cercuri de lectură",
    ],
    correct_option_index: 1,
    explanation: "Art. 209 din Legea 198/2023 interzice expres activitățile de pregătire privată (meditații) contra cost cu elevii de la clasele la care predă cadrul didactic.",
    citation: "Legea 198/2023, Art. 209 alin. (2)",
  },
  {
    id: "tit_q10",
    question: "10. Principiul transdisciplinarității în educație presupune:",
    options: [
      "A) Predarea a două materii în aceeași oră de către doi profesori",
      "B) Abordarea unor teme globale și concepte integratoare care transcend granițele disciplinelor tradiționale",
      "C) Renunțarea la programa școlară",
      "D) Fuziunea obligatorie a tuturor științelor exacte",
    ],
    correct_option_index: 1,
    explanation: "Transdisciplinaritatea transcende granițele disciplinare pentru a explora realitatea multidimensională și competențele de viață.",
    citation: "Cadrul de Referință al Curriculumului Național",
  },
];

// Default questions for Concurs Director (Subiectul I)
const DIRECTOR_DEFAULT_MCQS: McqQuestion[] = [
  {
    id: "dir_q1",
    question: "1. Cine are calitatea de ordonator terțiar de credite în unitățile de învățământ preuniversitar de stat?",
    options: [
      "A) Directorul adjunct",
      "B) Directorul unității de învățământ",
      "C) Contabilul-șef",
      "D) Președintele comitetului de părinți",
    ],
    correct_option_index: 1,
    explanation: "Directorul unității de învățământ este ordonator terțiar de credite și răspunde direct de execuția bugetară conform legii.",
    citation: "Legea 198/2023, Art. 192",
  },
  {
    id: "dir_q2",
    question: "2. Consiliul de Administrație al unei unități școlare cu peste 400 de elevi este format din:",
    options: [
      "A) 5, 7 sau 9 membri",
      "B) 7, 9 sau 11 membri conform specificului",
      "C) Doar director și inspectori",
      "D) 15 membri obligatoriu",
    ],
    correct_option_index: 1,
    explanation: "Componența CA este reglementată la 7, 9 sau 11 membri, asigurând paritatea între cadre didactice, părinți și reprezentanți ai autorității locale.",
    citation: "Legea 198/2023, Art. 128 & ROFUIP Art. 18",
  },
  {
    id: "dir_q3",
    question: "3. În Modelul Politic de management educațional (Tony Bush), puterea este derivată primordial din:",
    options: [
      "A) Poziția formală ierarhică",
      "B) Controlul resurselor critice și formarea de coaliții de negociere",
      "C) Consensul colegial spontan",
      "D) Ritualuri și simboluri ancestrale",
    ],
    correct_option_index: 1,
    explanation: "În modelele politice, deciziile rezultă din negociere, alianțe și controlul resurselor între grupuri de interese concurente.",
    citation: "Tony Bush (2011), Theories of Educational Leadership and Management, cap. 5",
  },
  {
    id: "dir_q4",
    question: "4. Ce procent din CA trebuie să voteze favorabil pentru adoptarea Regulamentului de Ordine Interioară (ROI)?",
    options: ["A) Majoritatea simplă a celor prezenți", "B) Votul a cel puțin 2/3 din numărul total al membrilor CA", "C) Doar votul directorului", "D) 100% unanimitate"],
    correct_option_index: 1,
    explanation: "Hotărârile privind regulamentele interne și bugetul se adoptă cu votul a cel puțin 2/3 din numărul total al membrilor CA.",
    citation: "ROFUIP 5726/2024, Art. 21",
  },
  {
    id: "dir_q5",
    question: "5. În cazul unei sesizări scrise privind o abatere disciplinară a unui profesor, cine numește Comisia de Cercetare Disciplinară Prealabilă?",
    options: [
      "A) Directorul prin decizie proprie, fără consultare",
      "B) Consiliul de Administrație al unității școlare",
      "C) Inspectoratul Școlar Județean direct",
      "D) Ministerul Educației",
    ],
    correct_option_index: 1,
    explanation: "Consiliul de Administrație aprobă cercetarea și numește membrii comisiei de cercetare disciplinară prealabilă.",
    citation: "Legea 198/2023, Art. 210",
  },
  {
    id: "dir_q6",
    question: "6. Proiectul de Dezvoltare Instituțională (PDI) al unei școli acoperă o perioadă strategică de:",
    options: ["A) 1 an școlar", "B) 2 ani", "C) 4-5 ani", "D) 10 ani"],
    correct_option_index: 2,
    explanation: "PDI reprezintă documentul de planificare strategică pe termen mediu al unității școlare, acoperind un ciclu de 4-5 ani.",
    citation: "Standardele de calitate ARACIP",
  },
  {
    id: "dir_q7",
    question: "7. Comisia pentru Asigurarea Calității (CEAC) este condusă de:",
    options: [
      "A) Directorul unității de învățământ",
      "B) Un cadru didactic ales prin vot secret de către Consiliul Profesoral",
      "C) Reprezentantul primăriei",
      "D) Cel mai vechi profesor din școală",
    ],
    correct_option_index: 1,
    explanation: "Coordonatorul CEAC este ales prin vot secret de Consiliul Profesoral, directorul neavând voie să fie coordonator CEAC.",
    citation: "Legea asigurării calității în învățământ & ROFUIP",
  },
  {
    id: "dir_q8",
    question: "8. În Modelul Colegial (Tony Bush), stilul de leadership cel mai compatibil este:",
    options: ["A) Leadership-ul autocratic/autoritar", "B) Leadership-ul participativ / distribuit", "C) Leadership-ul de tip 'laissez-faire'", "D) Leadership-ul tranzacțional rigid"],
    correct_option_index: 1,
    explanation: "Modelul colegial presupune că profesioniștii împărtășesc puterea decizională prin leadership distribuit și participativ.",
    citation: "Tony Bush (2011), cap. 4 — Collegial Models",
  },
  {
    id: "dir_q9",
    question: "9. Finanțarea de bază a unităților de învățământ preuniversitar se realizează pe principiul:",
    options: [
      "A) Numărului de clădiri deținute",
      "B) Costului standard per elev/preșcolar ('finanțarea urmează elevul')",
      "C) Numărului de profesori cu gradul didactic I",
      "D) Doar din venituri proprii și sponsorizări",
    ],
    correct_option_index: 1,
    explanation: "Finanțarea de bază se asigură din bugetul de stat, prin cost standard per elev/preșcolar multiplicat cu coeficienții specifici.",
    citation: "Legea 198/2023, Art. 138-140",
  },
  {
    id: "dir_q10",
    question: "10. Ce atribuție are Comisia Paritară constituită la nivelul unității de învățământ?",
    options: [
      "A) Notarea elevilor la olimpiade",
      "B) Negocierea și monitorizarea aplicării Contractului Colectiv de Muncă (CCM)",
      "C) Stabilirea orarului claselor",
      "D) Organizarea serbărilor școlare",
    ],
    correct_option_index: 1,
    explanation: "Comisia paritară administrație-sindicate monitorizează respectarea drepturilor salariaților și a CCM la nivel de unitate.",
    citation: "Codul Muncii & CCM la nivel de sector învățământ",
  },
];

export async function getMockExamVariants(): Promise<MockExamVariant[]> {
  const supabase = await getSupabase();

  // 1. Fetch Module 6
  const { data: rawModule } = await supabase
    .from("modules")
    .select("id")
    .eq("slug", "saptamana-6-simulari-oficiale")
    .single();

  const moduleData = (rawModule as unknown as ModuleRow) || null;
  if (!moduleData) return [];

  // 2. Fetch lessons in Module 6
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("id, slug, title, type, order_index")
    .eq("module_id", moduleData.id)
    .order("order_index", { ascending: true });

  const lessons = (rawLessons as unknown as LessonRow[]) || [];
  const variants: MockExamVariant[] = [];

  for (const l of lessons) {
    const { count } = await supabase
      .from("lesson_blocks")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", l.id);

    let examType: "definitivat" | "titularizare" | "concurs_director" = "definitivat";
    let badgeLabel = "Definitivat în Învățământ";
    let description = "Simulare completă pentru examenul de Definitivat: legislație școlară (Art. 207-216), didactică generală și cercetare disciplinară.";

    if (l.slug.includes("titularizare")) {
      examType = "titularizare";
      badgeLabel = "Titularizare în Învățământ";
      description = "Simulare oficială pentru concursul de Titularizare: curriculum centrat pe competențe, strategii didactice incluzive și evaluare formativă Hattie.";
    } else if (l.slug.includes("concurs-director")) {
      examType = "concurs_director";
      badgeLabel = "Concurs Director Școlar";
      description = "Simulare oficială pentru funcțiile de conducere: atribuțiile CA, management strategic PDI, execuție bugetară și modele de leadership Tony Bush.";
    }

    variants.push({
      id: l.id,
      slug: l.slug,
      title: l.title,
      exam_type: examType,
      badge_label: badgeLabel,
      duration_minutes: 180,
      total_points: 100,
      oficiu_points: 10,
      block_count: count || 0,
      description,
    });
  }

  return variants;
}

export async function getMockExamByIdOrSlug(idOrSlug: string): Promise<MockExamStructure | null> {
  const supabase = await getSupabase();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const query = supabase.from("lessons").select("id, slug, title, type");
  const { data: rawLesson } = isUuid
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();

  if (!rawLesson) return null;
  const lesson = rawLesson as unknown as LessonRow;

  const { data: rawBlocks } = await supabase
    .from("lesson_blocks")
    .select("id, type, order_index, content_json")
    .eq("lesson_id", lesson.id)
    .order("order_index", { ascending: true });

  const blocks = (rawBlocks as unknown as LessonBlockRow[]) || [];

  let examType: "definitivat" | "titularizare" | "concurs_director" = "definitivat";
  let badgeLabel = "Definitivat";
  let defaultMcqs = TITULARIZARE_DEFAULT_MCQS;

  if (lesson.slug.includes("titularizare")) {
    examType = "titularizare";
    badgeLabel = "Titularizare";
    defaultMcqs = TITULARIZARE_DEFAULT_MCQS;
  } else if (lesson.slug.includes("concurs-director")) {
    examType = "concurs_director";
    badgeLabel = "Concurs Director";
    defaultMcqs = DIRECTOR_DEFAULT_MCQS;
  }

  const exam: MockExamStructure = {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    exam_type: examType,
    badge_label: badgeLabel,
    duration_minutes: 180,
    total_points: 100,
    oficiu_points: 10,
    cover_markdown: "",
    subiectul_1: {
      title: "Subiectul I (30 puncte) — Întrebări Grilă Legislație & Didactică",
      points: 30,
      description: "10 itemi cu alegere multiplă (3 puncte per răspuns corect). Selectați varianta corectă din cele patru opțiuni propuse.",
      questions: [],
    },
    subiectul_2: {
      title: "Subiectul II (30 puncte) — Didactică & Curriculum Aplicat",
      points: 30,
      question: "Prezentați în 300-400 de cuvinte rolul evaluării formative și al feedback-ului didactic imediat (Hattie, d = 0.75) în optimizarea procesului de predare-învățare. Argumentați utilizarea matricilor de evaluare (rubrici) și a fișelor de autoevaluare la clasă.",
      rubric_criteria: [
        "Definirea riguroasă a evaluării formative și diferențierea față de cea sumativă (6 puncte)",
        "Integrarea teoriei lui John Hattie privind feedback-ul didactic eficient (6 puncte)",
        "Exemplificarea concretă a unei rubrici de evaluare / descriptorilor de performanță (6 puncte)",
        "Descrierea utilizării fișelor de autoevaluare pentru metacogniția elevilor (6 puncte)",
        "Claritatea exprimării, terminologia pedagogică adecvată și coerența argumentării (6 puncte)",
      ],
      sample_answer: "Evaluarea formativă reprezintă un demers continuu și interactiv prin care profesorul și elevii monitorizează progresul în raport cu obiectivele de învățare. Spre deosebire de evaluarea sumativă cu caracter de bilanț, evaluarea formativă furnizează feedback în timp real. Conform sintezei meta-analitice a lui John Hattie (Visible Learning), feedback-ul orientat spre sarcină și proces atinge o mărime a efectului de d = 0.75, situându-se în zona efectelor optime de creștere educațională...",
      citation: "Hattie, J. (2009). Visible Learning & Cadrul Național de Învățare",
    },
    subiectul_3: {
      title: "Subiectul III (30 puncte) — Speță Managerială & Leadership",
      points: 30,
      question: "Analizați speța managerială pe baza celor 5 criterii de evaluare oficiale, integrând prevederile din Legea 198/2023, ROFUIP și modelele de leadership descrise de Tony Bush.",
      rubric_criteria: [
        "Încadrarea juridică corectă a faptelor și identificarea articolelor de lege incidente (6 puncte)",
        "Aplicarea teoriei managementului: Modelul Formal vs. Modelul Colegial / Politic (Tony Bush) (6 puncte)",
        "Etapele procedurale obligatorii conform Legii 198/2023 (sesizare, cercetare, dreptul la apărare, decizie) (6 puncte)",
        "Măsurile manageriale de remediere a climatului școlar și prevenire a recidivei (6 puncte)",
        "Redactarea clară, respectarea structurii logice și argumentarea cu referințe normative (6 puncte)",
      ],
      sample_answer: "I. Încadrarea normativă: Faptele reclamate intră sub incidența Art. 209-216 din Legea 198/2023 privind răspunderea disciplinară a personalului didactic. II. Procedura legală: Directorul înaintează sesizarea către Consiliul de Administrație, care decide declanșarea cercetării disciplinare prealabile și numește o comisie formată din 3-5 cadre didactice cu grad cel puțin egal. III. Dimensiunea managerială Tony Bush: În timp ce Modelul Formal impune respectarea strictă a normelor și termenelor legale (raport de cercetare în 30 de zile), rezolvarea sustenabilă necesită mecanisme din Modelul Colegial...",
      citation: "Legea Învățământului Preuniversitar 198/2023 & Tony Bush (2011)",
    },
    references: [],
  };

  for (const b of blocks) {
    const content = (b.content_json as Record<string, unknown>) || {};
    if (b.type === "markdown" && !exam.cover_markdown) {
      exam.cover_markdown = (content.content as string) || (content.markdown as string) || "";
    } else if (b.type === "callout" && !exam.instructions_callout) {
      exam.instructions_callout = {
        title: (content.title as string) || "Instrucțiuni de lucru",
        content: (content.content as string) || (content.body as string) || "",
        variant: (content.variant as string) || "info",
      };
    } else if (b.type === "quiz_mcq") {
      const qList = (content.questions as Array<Record<string, unknown>>) || [];
      if (qList.length > 0) {
        exam.subiectul_1.questions = qList.map((q, idx) => ({
          id: (q.id as string) || `q_${idx}`,
          question: (q.question as string) || "",
          options: (q.options as string[]) || [],
          correct_option_index: typeof q.correct_option_index === "number" ? q.correct_option_index : 0,
          explanation: (q.explanation as string) || "",
          citation: Array.isArray(q.citations) && q.citations[0] ? (q.citations[0] as { citation?: string }).citation : undefined,
        }));
      }
    } else if (b.type === "quiz_open") {
      const qText = (content.question as string) || (content.prompt as string) || "";
      const rubric = (content.rubric_criteria as string[]) || (content.rubric as string[]) || [];
      const sample = (content.sample_answer as string) || (content.exemplar_answer as string) || "";
      const cit = Array.isArray(content.citations) && content.citations[0] ? (content.citations[0] as { citation?: string }).citation : undefined;

      if (qText.toLowerCase().includes("subiectul ii") || !exam.subiectul_2.question.includes("Hattie")) {
        exam.subiectul_2 = {
          title: "Subiectul II (30 puncte) — Didactică & Curriculum",
          points: 30,
          question: qText,
          rubric_criteria: rubric.length > 0 ? rubric : exam.subiectul_2.rubric_criteria,
          sample_answer: sample || exam.subiectul_2.sample_answer,
          citation: cit,
        };
      } else {
        exam.subiectul_3 = {
          title: "Subiectul III (30 puncte) — Speță Managerială & Leadership",
          points: 30,
          question: qText,
          rubric_criteria: rubric.length > 0 ? rubric : exam.subiectul_3.rubric_criteria,
          sample_answer: sample || exam.subiectul_3.sample_answer,
          citation: cit,
        };
      }
    } else if (b.type === "reference_list") {
      const refs = (content.references as Array<{ locator: string; citation: string; source_url?: string }>) || [];
      exam.references = refs;
    }
  }

  // Fallback to default questions if the exam didn't have 10 MCQs in the block
  if (exam.subiectul_1.questions.length === 0) {
    exam.subiectul_1.questions = defaultMcqs;
  }

  return exam;
}

// Backwards compatibility
export async function getMockExamBySlug(slug: string): Promise<MockExamStructure | null> {
  return getMockExamByIdOrSlug(slug);
}
