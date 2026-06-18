/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SkillItem {
  skill: string;
  category: string;
}

export interface MissingSkillItem {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface KeywordItem {
  keyword: string;
  foundInResume: boolean;
  recommendation: string;
}

export interface StrengthItem {
  title: string;
  description: string;
}

export interface WeaknessItem {
  title: string;
  description: string;
}

export interface ImprovementSuggestion {
  section: string;
  currentText: string;
  suggestedText: string;
  explanation: string;
}

export interface TailoredBullet {
  originalBullet: string;
  tailoredBullet: string;
  explanation: string;
}

export interface ResumeAnalysisResult {
  matchPercentage: number;
  summary: string;
  matchedSkills: SkillItem[];
  missingSkills: MissingSkillItem[];
  keywordAnalysis: KeywordItem[];
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  improvementSuggestions: ImprovementSuggestion[];
  tailoredBullets: TailoredBullet[];
}
