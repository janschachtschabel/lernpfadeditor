export const exampleActors: Actor[] = [
  {
    id: "A1",
    name: "Lehrender",
    type: "Einzelperson",
    demographic_data: {
      age: 35,
      gender: "männlich",
      ethnic_background: "deutsch"
    },
    education: {
      education_level: "Master of Education",
      class_level: "Sekundarstufe I",
      subject_focus: "Mathematik, Informatik"
    },
    competencies: {
      subject_competencies: ["Mathematik", "Informatik"],
      cognitive_competencies: ["Analytisches Denken", "Problemlösung"],
      methodical_competencies: ["Differenzierte Unterrichtsgestaltung", "Digitale Mediennutzung"],
      affective_competencies: ["Empathie", "Geduld"],
      digital_competencies: ["Lernplattformen", "Digitale Werkzeuge"],
      language_skills: {
        languages: ["Deutsch", "Englisch"],
        proficiency_levels: {
          "Deutsch": "C2",
          "Englisch": "B2"
        }
      }
    },
    social_form: "Lehrkraft",
    learning_requirements: {
      learning_preferences: ["Praxisorientiert", "Digital"],
      special_needs: [],
      technical_requirements: ["Computer", "Präsentationssystem"]
    },
    interests_and_goals: {
      interests: ["Digitale Bildung", "Inklusive Pädagogik"],
      goals: ["Förderung individueller Lernwege", "Integration digitaler Medien"],
      motivation: {
        type: "intrinsic",
        level: "high"
      }
    },
    social_structure: {
      group_size: 1,
      heterogeneity: "n/a"
    }
  },
  {
    id: "A2",
    name: "Hauptlerngruppe",
    type: "Gruppe",
    demographic_data: {
      age_range: "14-15",
      gender_distribution: "gemischt",
      ethnic_background: "diverse"
    },
    education: {
      education_level: "Sekundarstufe I",
      class_level: "9. Klasse",
      subject_focus: "Mathematik"
    },
    competencies: {
      subject_competencies: ["Grundrechenarten", "Algebra Grundlagen"],
      cognitive_competencies: ["Logisches Denken", "Abstraktion"],
      methodical_competencies: ["Gruppenarbeit", "Selbstorganisation"],
      affective_competencies: ["Teamfähigkeit"],
      digital_competencies: ["Grundlegende PC-Kenntnisse"],
      language_skills: {
        languages: ["Deutsch"],
        proficiency_levels: {
          "Deutsch": "C1"
        }
      }
    },
    social_form: "Klassenverband",
    learning_requirements: {
      learning_preferences: ["Praktische Übungen", "Visuelle Darstellungen"],
      special_needs: [],
      technical_requirements: ["Taschenrechner"]
    },
    interests_and_goals: {
      interests: ["Mathematik", "Digitale Medien"],
      goals: ["Verständnis der Addition", "Problemlösekompetenz"],
      motivation: {
        type: "mixed",
        level: "medium"
      }
    },
    social_structure: {
      group_size: 20,
      heterogeneity: "mittel"
    }
  },
  {
    id: "A3",
    name: "Sprachfördergruppe",
    type: "Gruppe",
    demographic_data: {
      age_range: "14-15",
      gender_distribution: "gemischt",
      ethnic_background: "diverse"
    },
    education: {
      education_level: "Sekundarstufe I",
      class_level: "9. Klasse",
      subject_focus: "Mathematik"
    },
    competencies: {
      subject_competencies: ["Grundrechenarten"],
      cognitive_competencies: ["Logisches Denken"],
      methodical_competencies: ["Visualisierung"],
      affective_competencies: ["Teamfähigkeit"],
      digital_competencies: ["Grundlegende PC-Kenntnisse"],
      language_skills: {
        languages: ["Deutsch"],
        proficiency_levels: {
          "Deutsch": "B1"
        }
      }
    },
    social_form: "Fördergruppe",
    learning_requirements: {
      learning_preferences: ["Visuelle Unterstützung", "Sprachliche Hilfen"],
      special_needs: ["Sprachförderung"],
      technical_requirements: ["Taschenrechner"]
    },
    interests_and_goals: {
      interests: ["Mathematik"],
      goals: ["Sprachkompetenz", "Mathematisches Verständnis"],
      motivation: {
        type: "mixed",
        level: "medium"
      }
    },
    social_structure: {
      group_size: 8,
      heterogeneity: "hoch"
    }
  }
];

export const exampleEnvironments: LearningEnvironment[] = [
  {
    id: "ENV1",
    name: "Mathematik-Klassenraum",
    description: "Klassenraum mit digitaler und analoger Ausstattung für Mathematikunterricht",
    materials: [
      {
        id: "ENV1-M1",
        name: "Arbeitsblätter Addition",
        material_type: "Arbeitsblatt",
        source: "manual",
        access_link: "materials/addition_standard.pdf"
      },
      {
        id: "ENV1-M2",
        name: "Visualisierungskarten",
        material_type: "Bildkarten",
        source: "manual",
        access_link: "materials/visual_cards.pdf"
      },
      {
        id: "ENV1-M3",
        name: "Mehrsprachiges Mathe-Glossar",
        material_type: "Glossar",
        source: "manual",
        access_link: "materials/math_glossary.pdf"
      },
      {
        id: "ENV1-M4",
        name: "Interaktive Übungen",
        material_type: "Digitales Lernmaterial",
        source: "manual",
        access_link: "https://example.com/math-exercises"
      }
    ],
    tools: [
      {
        id: "ENV1-T1",
        name: "Dokumentenkamera",
        tool_type: "Hardware",
        source: "manual",
        access_link: ""
      },
      {
        id: "ENV1-T2",
        name: "Taschenrechner",
        tool_type: "Hardware",
        source: "manual",
        access_link: ""
      },
      {
        id: "ENV1-T3",
        name: "Mathematik-App",
        tool_type: "Software",
        source: "manual",
        access_link: "apps/math_trainer"
      },
      {
        id: "ENV1-T4",
        name: "Digitales Whiteboard",
        tool_type: "Hardware",
        source: "manual",
        access_link: ""
      }
    ],
    services: [
      {
        id: "ENV1-S1",
        name: "Sprachunterstützung",
        service_type: "Förderung",
        source: "manual",
        access_link: ""
      },
      {
        id: "ENV1-S2",
        name: "Mathematische Förderung",
        service_type: "Förderung",
        source: "manual",
        access_link: ""
      },
      {
        id: "ENV1-S3",
        name: "Online-Lernplattform",
        service_type: "Digital",
        source: "manual",
        access_link: "https://example.com/platform"
      }
    ]
  }
];

export const exampleTemplate = {
  metadata: {
    title: "Addition für alle – inklusive Mathematik",
    description: "Ein inklusives Lernobjekt zur Förderung der Additionsfähigkeiten und Sprachkompetenzen bei Schülern der 9. Klasse",
    keywords: ["Addition", "Mathematik", "Inklusion", "Sprachförderung", "Differenzierung"],
    author: "Jan Schachtschabel",
    version: "1.0"
  },
  problem: {
    problem_description: "Schüler mit unterschiedlichen sprachlichen Voraussetzungen sollen die Bedeutung und Anwendung der Addition verstehen und ihre mathematischen sowie sprachlichen Kompetenzen entwickeln.",
    learning_goals: [
      "Verständnis der Grundlagen der Addition",
      "Anwendung der Addition in verschiedenen Kontexten",
      "Förderung der sprachlichen Kompetenzen",
      "Entwicklung von Problemlösefähigkeiten"
    ],
    didactic_keywords: ["Differenzierung", "Inklusion", "Sprachsensibler Fachunterricht", "Digitale Medien"]
  },
  context: {
    target_group: "Schüler der 9. Klasse mit heterogenen Sprachkenntnissen",
    subject: "Mathematik",
    educational_level: "Sekundarstufe I",
    prerequisites: "Grundlegende Deutschkenntnisse, Zahlenverständnis",
    time_frame: "45 Minuten"
  },
  influence_factors: [
    {
      factor: "Sprachliche Heterogenität",
      description: "Unterschiedliche Deutschkenntnisse erfordern differenzierte sprachliche Unterstützung"
    },
    {
      factor: "Digitale Kompetenzen",
      description: "Verschiedene Erfahrungsniveaus mit digitalen Werkzeugen"
    },
    {
      factor: "Lernmotivation",
      description: "Unterschiedliche Motivationslagen und Interessensbereiche"
    }
  ],
  solution: {
    solution_description: "Implementierung eines differenzierten, sprachsensiblen Mathematikunterrichts mit digitaler Unterstützung",
    didactic_approach: "Handlungsorientiertes und entdeckendes Lernen mit digitaler und sprachlicher Unterstützung",
    didactic_template: {
      learning_sequences: [
        {
          sequence_id: "LS1",
          sequence_name: "Einführung in die Addition",
          time_frame: "45 Minuten",
          learning_goal: "Grundlegendes Verständnis der Addition und ihrer sprachlichen Darstellung",
          phases: [
            {
              phase_id: "LS1-P1",
              phase_name: "Aktivierung",
              time_frame: "10 Minuten",
              learning_goal: "Vorwissen aktivieren und Interesse wecken",
              activities: [
                {
                  activity_id: "LS1-P1-A1",
                  name: "Zahlenspiel",
                  description: "Spielerische Einführung mit visuellen Elementen",
                  duration: 10,
                  goal: "Spielerisches Aufwärmen und Aktivierung des Vorwissens",
                  prerequisite_activity: null,
                  transition_type: "sequential",
                  condition_description: null,
                  next_activity: ["LS1-P2-A1"],
                  assessment: {
                    type: "formative",
                    methods: ["Beobachtung"],
                    criteria: ["Aktive Teilnahme", "Grundverständnis"]
                  },
                  roles: [
                    {
                      role_id: "LS1-P1-A1-R1",
                      role_name: "Moderator",
                      actor_id: "A1",
                      task_description: "Leitet das Zahlenspiel und stellt gezielte Fragen",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M2"],
                        selected_tools: ["ENV1-T1", "ENV1-T4"],
                        selected_services: []
                      }
                    },
                    {
                      role_id: "LS1-P1-A1-R2",
                      role_name: "Teilnehmer Hauptgruppe",
                      actor_id: "A2",
                      task_description: "Aktive Teilnahme am Zahlenspiel",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M2"],
                        selected_tools: [],
                        selected_services: []
                      }
                    },
                    {
                      role_id: "LS1-P1-A1-R3",
                      role_name: "Teilnehmer Sprachförderung",
                      actor_id: "A3",
                      task_description: "Teilnahme am Zahlenspiel mit sprachlicher Unterstützung",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M2", "ENV1-M3"],
                        selected_tools: [],
                        selected_services: ["ENV1-S1"]
                      }
                    }
                  ]
                }
              ],
              prerequisite_phase: null,
              transition_type: "sequential",
              condition_description: null,
              next_phase: "LS1-P2"
            },
            {
              phase_id: "LS1-P2",
              phase_name: "Erarbeitung",
              time_frame: "20 Minuten",
              learning_goal: "Selbstständige Erarbeitung der Additionsregeln",
              activities: [
                {
                  activity_id: "LS1-P2-A1",
                  name: "Regelentdeckung",
                  description: "Entdeckung der Additionsregeln anhand von Beispielen",
                  duration: 10,
                  goal: "Selbstständige Erarbeitung der Additionsregeln",
                  prerequisite_activity: "LS1-P1-A1",
                  transition_type: "parallel",
                  condition_description: null,
                  next_activity: ["LS1-P2-A2"],
                  assessment: {
                    type: "formative",
                    methods: ["Peer-Feedback", "Selbstreflexion"],
                    criteria: ["Regelverständnis", "Zusammenarbeit"]
                  },
                  roles: [
                    {
                      role_id: "LS1-P2-A1-R1",
                      role_name: "Lernbegleiter",
                      actor_id: "A1",
                      task_description: "Unterstützt den Entdeckungsprozess und gibt Hilfestellung",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M2", "ENV1-M3"],
                        selected_tools: ["ENV1-T1", "ENV1-T4"],
                        selected_services: ["ENV1-S1", "ENV1-S2"]
                      }
                    },
                    {
                      role_id: "LS1-P2-A1-R2",
                      role_name: "Entdecker Hauptgruppe",
                      actor_id: "A2",
                      task_description: "Erarbeitet die Regeln in Partnerarbeit",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M4"],
                        selected_tools: ["ENV1-T2", "ENV1-T3"],
                        selected_services: ["ENV1-S3"]
                      }
                    },
                    {
                      role_id: "LS1-P2-A1-R3",
                      role_name: "Entdecker Sprachförderung",
                      actor_id: "A3",
                      task_description: "Erarbeitet die Regeln mit sprachlicher Unterstützung",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M3", "ENV1-M4"],
                        selected_tools: ["ENV1-T2", "ENV1-T3"],
                        selected_services: ["ENV1-S1", "ENV1-S2", "ENV1-S3"]
                      }
                    }
                  ]
                },
                {
                  activity_id: "LS1-P2-A2",
                  name: "Übungsphase",
                  description: "Anwendung der entdeckten Regeln",
                  duration: 10,
                  goal: "Festigung der Additionsregeln durch Übung",
                  prerequisite_activity: "LS1-P2-A1",
                  transition_type: "branching",
                  condition_description: "Basierend auf Lernerfolg: Zusatzaufgaben oder Wiederholung",
                  next_activity: ["LS1-P3-A1"],
                  is_optional: false,
                  repeat_until: "80% der Aufgaben korrekt gelöst",
                  assessment: {
                    type: "formative",
                    methods: ["Selbstkontrolle", "Automatische Auswertung"],
                    criteria: ["Korrektheit", "Lösungsweg"]
                  },
                  roles: [
                    {
                      role_id: "LS1-P2-A2-R1",
                      role_name: "Lernbegleiter",
                      actor_id: "A1",
                      task_description: "Beobachtet und unterstützt bei Bedarf",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1"],
                        selected_tools: ["ENV1-T4"],
                        selected_services: ["ENV1-S2"]
                      }
                    },
                    {
                      role_id: "LS1-P2-A2-R2",
                      role_name: "Übende Hauptgruppe",
                      actor_id: "A2",
                      task_description: "Bearbeitet Übungsaufgaben selbstständig",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M4"],
                        selected_tools: ["ENV1-T2", "ENV1-T3"],
                        selected_services: ["ENV1-S3"]
                      }
                    },
                    {
                      role_id: "LS1-P2-A2-R3",
                      role_name: "Übende Sprachförderung",
                      actor_id: "A3",
                      task_description: "Bearbeitet sprachsensible Übungsaufgaben",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M3", "ENV1-M4"],
                        selected_tools: ["ENV1-T2", "ENV1-T3"],
                        selected_services: ["ENV1-S1", "ENV1-S2", "ENV1-S3"]
                      }
                    }
                  ]
                }
              ],
              prerequisite_phase: "LS1-P1",
              transition_type: "sequential",
              condition_description: null,
              next_phase: "LS1-P3"
            },
            {
              phase_id: "LS1-P3",
              phase_name: "Sicherung",
              time_frame: "15 Minuten",
              learning_goal: "Gemeinsame Reflexion und Sicherung der Erkenntnisse",
              activities: [
                {
                  activity_id: "LS1-P3-A1",
                  name: "Präsentation und Diskussion",
                  description: "Vorstellen der Erkenntnisse und gemeinsame Diskussion",
                  duration: 15,
                  goal: "Gemeinsames Verständnis der Additionsregeln",
                  prerequisite_activity: "LS1-P2-A2",
                  transition_type: "feedback_loops",
                  condition_description: "Bei Bedarf Rückkehr zu einzelnen Konzepten",
                  next_activity: [],
                  assessment: {
                    type: "summative",
                    methods: ["Präsentation", "Diskussionsbeteiligung"],
                    criteria: ["Verständnis", "Kommunikationsfähigkeit"]
                  },
                  roles: [
                    {
                      role_id: "LS1-P3-A1-R1",
                      role_name: "Moderator",
                      actor_id: "A1",
                      task_description: "Moderiert die Diskussion und fasst Ergebnisse zusammen",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M2"],
                        selected_tools: ["ENV1-T1", "ENV1-T4"],
                        selected_services: []
                      }
                    },
                    {
                      role_id: "LS1-P3-A1-R2",
                      role_name: "Präsentierende Hauptgruppe",
                      actor_id: "A2",
                      task_description: "Stellt Erkenntnisse vor und beteiligt sich an Diskussion",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M1", "ENV1-M2"],
                        selected_tools: ["ENV1-T4"],
                        selected_services: []
                      }
                    },
                    {
                      role_id: "LS1-P3-A1-R3",
                      role_name: "Präsentierende Sprachförderung",
                      actor_id: "A3",
                      task_description: "Stellt Erkenntnisse mit Visualisierungen vor",
                      learning_environment: {
                        environment_id: "ENV1",
                        selected_materials: ["ENV1-M2", "ENV1-M3"],
                        selected_tools: ["ENV1-T4"],
                        selected_services: ["ENV1-S1"]
                      }
                    }
                  ]
                }
              ],
              prerequisite_phase: "LS1-P2",
              transition_type: "sequential",
              condition_description: null,
              next_phase: null
            }
          ],
          prerequisite_learningsequences: [],
          transition_type: "sequential",
          condition_description: null,
          next_learningsequence: []
        }
      ]
    }
  },
  consequences: {
    advantages: [
      "Individuelle Förderung durch differenzierte Materialien",
      "Integration von Sprach- und Fachlernen",
      "Aktive Beteiligung aller Schüler",
      "Flexible Anpassung an verschiedene Lerngeschwindigkeiten"
    ],
    disadvantages: [
      "Hoher Vorbereitungsaufwand",
      "Komplexe Materialerstellung",
      "Herausforderung bei der Koordination verschiedener Gruppen"
    ]
  },
  implementation_notes: [
    {
      note_id: "Note1",
      description: "Materialien vorab mehrsprachig aufbereiten"
    },
    {
      note_id: "Note2",
      description: "Technische Ausstattung vor Unterrichtsbeginn prüfen"
    },
    {
      note_id: "Note3",
      description: "Klare Signale für Phasenwechsel vereinbaren"
    }
  ],
  related_patterns: [
    "Sprachsensibler Fachunterricht",
    "Digitale Lernbegleitung",
    "Kooperatives Lernen",
    "Individualisiertes Lernen"
  ],
  feedback: {
    comments: [
      {
        date: "2024-03-14",
        name: "Dr. Schmidt",
        comment: "Sehr gut strukturiertes Konzept mit durchdachter Differenzierung"
      },
      {
        date: "2024-03-15",
        name: "Prof. Meyer",
        comment: "Gelungene Integration von Sprach- und Fachlernen"
      }
    ]
  },
  sources: [
    {
      source_id: "S1",
      title: "Sprachsensibler Fachunterricht",
      author: "Josef Leisen",
      year: 2019,
      publisher: "Klett-Kallmeyer",
      url: "https://example.com/sprachsensibler-fachunterricht"
    },
    {
      source_id: "S2",
      title: "Digitale Medien im inklusiven Mathematikunterricht",
      author: "Maria Weber",
      year: 2023,
      publisher: "Bildungsverlag",
      url: "https://example.com/digitale-medien-mathe"
    }
  ],
  actors: exampleActors,
  environments: exampleEnvironments
};