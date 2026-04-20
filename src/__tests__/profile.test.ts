import { describe, it, expect } from "vitest";
import {
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  POST_GRADUATE_LEVELS,
  CERTIFICATION_LEVELS,
  LANGUAGE_LEVELS,
  generateProfileId,
} from "@/lib/profile";
import type {
  ExperienceLevel,
  EducationLevel,
  PostGraduateLevel,
  CertificationLevel,
  LanguageLevel,
  JobProfile,
} from "@/lib/profile";

describe("Tipos union de ExperienceLevel", () => {
  it("aceita exatamente os 5 valores válidos", () => {
    const validValues: ExperienceLevel[] = [
      "< 1 ano",
      "1-3 anos",
      "3-5 anos",
      "5-10 anos",
      "> 10 anos",
    ];
    expect(validValues).toHaveLength(5);
  });
});

describe("Tipos union de EducationLevel", () => {
  it("aceita exatamente os 3 valores válidos", () => {
    const validValues: EducationLevel[] = [
      "Ensino médio",
      "Superior cursando",
      "Superior completo",
    ];
    expect(validValues).toHaveLength(3);
  });
});

describe("Tipos union de PostGraduateLevel", () => {
  it("aceita exatamente os 3 valores válidos", () => {
    const validValues: PostGraduateLevel[] = [
      "Não exigido",
      "Desejável",
      "Necessário",
    ];
    expect(validValues).toHaveLength(3);
  });
});

describe("Tipos union de CertificationLevel", () => {
  it("aceita exatamente os 3 valores válidos", () => {
    const validValues: CertificationLevel[] = ["Não", "Desejável", "Sim"];
    expect(validValues).toHaveLength(3);
  });
});

describe("Tipos union de LanguageLevel", () => {
  it("aceita exatamente os 5 valores válidos", () => {
    const validValues: LanguageLevel[] = [
      "Não exigido",
      "Básico",
      "Intermediário",
      "Avançado",
      "Fluente",
    ];
    expect(validValues).toHaveLength(5);
  });
});

describe("EXPERIENCE_LEVELS", () => {
  it("tem exatamente 5 itens", () => {
    expect(EXPERIENCE_LEVELS).toHaveLength(5);
  });

  it("contém todos os valores de ExperienceLevel", () => {
    expect(EXPERIENCE_LEVELS).toContain("< 1 ano");
    expect(EXPERIENCE_LEVELS).toContain("1-3 anos");
    expect(EXPERIENCE_LEVELS).toContain("3-5 anos");
    expect(EXPERIENCE_LEVELS).toContain("5-10 anos");
    expect(EXPERIENCE_LEVELS).toContain("> 10 anos");
  });
});

describe("EDUCATION_LEVELS", () => {
  it("tem exatamente 3 itens", () => {
    expect(EDUCATION_LEVELS).toHaveLength(3);
  });

  it("contém todos os valores de EducationLevel", () => {
    expect(EDUCATION_LEVELS).toContain("Ensino médio");
    expect(EDUCATION_LEVELS).toContain("Superior cursando");
    expect(EDUCATION_LEVELS).toContain("Superior completo");
  });
});

describe("POST_GRADUATE_LEVELS", () => {
  it("tem exatamente 3 itens", () => {
    expect(POST_GRADUATE_LEVELS).toHaveLength(3);
  });

  it("contém todos os valores de PostGraduateLevel", () => {
    expect(POST_GRADUATE_LEVELS).toContain("Não exigido");
    expect(POST_GRADUATE_LEVELS).toContain("Desejável");
    expect(POST_GRADUATE_LEVELS).toContain("Necessário");
  });
});

describe("CERTIFICATION_LEVELS", () => {
  it("tem exatamente 3 itens", () => {
    expect(CERTIFICATION_LEVELS).toHaveLength(3);
  });

  it("contém todos os valores de CertificationLevel", () => {
    expect(CERTIFICATION_LEVELS).toContain("Não");
    expect(CERTIFICATION_LEVELS).toContain("Desejável");
    expect(CERTIFICATION_LEVELS).toContain("Sim");
  });
});

describe("LANGUAGE_LEVELS", () => {
  it("tem exatamente 5 itens", () => {
    expect(LANGUAGE_LEVELS).toHaveLength(5);
  });

  it("contém todos os valores de LanguageLevel", () => {
    expect(LANGUAGE_LEVELS).toContain("Não exigido");
    expect(LANGUAGE_LEVELS).toContain("Básico");
    expect(LANGUAGE_LEVELS).toContain("Intermediário");
    expect(LANGUAGE_LEVELS).toContain("Avançado");
    expect(LANGUAGE_LEVELS).toContain("Fluente");
  });
});

describe("generateProfileId()", () => {
  it("retorna UUID v4 válido", () => {
    const id = generateProfileId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("gera IDs diferentes em chamadas consecutivas (colisão-seguro)", () => {
    const id1 = generateProfileId();
    const id2 = generateProfileId();
    expect(id1).not.toBe(id2);
  });
});

describe("Interface JobProfile", () => {
  it("pode ser instanciada com todos os campos obrigatórios", () => {
    const profile: JobProfile = {
      id: generateProfileId(),
      title: "Desenvolvedor Backend",
      suggestedTitle: "Desenvolvedor Backend Sênior",
      experienceLevel: "3-5 anos",
      educationLevel: "Superior completo",
      postGraduateLevel: "Não exigido",
      certifications: "Não",
      englishLevel: "Intermediário",
      spanishLevel: "Não exigido",
      responsibilities: "Desenvolver APIs REST",
      qualifications: "Experiência com Node.js",
      behaviors: "Trabalho em equipe",
      challenges: "Crescer o time",
      additionalInfo: "Nenhuma",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(profile.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(profile.title).toBe("Desenvolvedor Backend");
    expect(profile.experienceLevel).toBe("3-5 anos");
  });

  it("aceita campos opcionais quando presentes", () => {
    const profile: JobProfile = {
      id: generateProfileId(),
      title: "Engenheiro de Dados",
      suggestedTitle: "Data Engineer",
      experienceLevel: "5-10 anos",
      educationLevel: "Superior completo",
      educationCourse: "Ciência da Computação",
      postGraduateLevel: "Desejável",
      postGraduateCourse: "Engenharia de Dados",
      certifications: "Sim",
      certificationsWhich: "AWS Certified",
      englishLevel: "Avançado",
      spanishLevel: "Não exigido",
      otherLanguage: "Francês",
      otherLanguageLevel: "Básico",
      responsibilities: "Construir pipelines de dados",
      qualifications: "Python, SQL",
      behaviors: "Curiosidade analítica",
      challenges: "Escalar infraestrutura",
      additionalInfo: "Ambiente remoto",
      systemsRequired: "AWS, Databricks",
      networkFolders: "\\\\servidor\\dados",
      internalNotes: "Candidato preferencial interno",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(profile.educationCourse).toBe("Ciência da Computação");
    expect(profile.postGraduateCourse).toBe("Engenharia de Dados");
    expect(profile.certificationsWhich).toBe("AWS Certified");
    expect(profile.otherLanguage).toBe("Francês");
    expect(profile.systemsRequired).toBe("AWS, Databricks");
    expect(profile.internalNotes).toBe("Candidato preferencial interno");
  });
});
