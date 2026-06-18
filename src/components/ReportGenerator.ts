/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeAnalysisResult } from "../types";

export function generateMarkdownReport(result: ResumeAnalysisResult, roleTitle: string): string {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let md = `# AI Resume Analysis Report\n\n`;
  md += `**AIs Analysis Date**: ${dateStr}  \n`;
  md += `**Target Position/Keywords**: ${roleTitle || "Target Job Description"}  \n`;
  md += `**ATS Match Score Alignment**: **${result.matchPercentage}%**  \n\n`;

  md += `--------------------------------------------------\n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `${result.summary}\n\n`;

  md += `--------------------------------------------------\n\n`;

  md += `## 2. Alignment Strengths\n\n`;
  if (result.strengths && result.strengths.length > 0) {
    result.strengths.forEach((item, idx) => {
      md += `### 👍 Strength #${idx + 1}: ${item.title}\n`;
      md += `${item.description}\n\n`;
    });
  } else {
    md += `No specific outstanding alignments found. Consider boosting technical credentials.\n\n`;
  }

  md += `--------------------------------------------------\n\n`;

  md += `## 3. Key Alignability Gaps & Weaknesses\n\n`;
  if (result.weaknesses && result.weaknesses.length > 0) {
    result.weaknesses.forEach((item, idx) => {
      md += `### ⚠️ Gap #${idx + 1}: ${item.title}\n`;
      md += `${item.description}\n\n`;
    });
  } else {
    md += `No severe alignment discrepancies found. The candidate is a strong fit.\n\n`;
  }

  md += `--------------------------------------------------\n\n`;

  md += `## 4. Keyword Analysis Compliance Matrix\n\n`;
  md += `| Keyword | Found | Recommended Integration Approach |\n`;
  md += `| :--- | :---: | :--- |\n`;
  if (result.keywordAnalysis && result.keywordAnalysis.length > 0) {
    result.keywordAnalysis.forEach((kw) => {
      md += `| **${kw.keyword}** | ${kw.foundInResume ? "✅ Found" : "❌ Missing"} | ${kw.recommendation} |\n`;
    });
  } else {
    md += `| No key terms evaluated | - | - |\n`;
  }
  md += `\n\n--------------------------------------------------\n\n`;

  md += `## 5. Skills Overview Matrix\n\n`;
  md += `### Matched Skills (Verified overlaps):\n`;
  if (result.matchedSkills && result.matchedSkills.length > 0) {
    result.matchedSkills.forEach((item) => {
      md += `- **${item.skill}** — _Category: ${item.category}_\n`;
    });
  } else {
    md += `- None listed. Expand your technical vocabulary.\n`;
  }
  md += `\n`;

  md += `### Missing Required Skills (Urgent gaps to address):\n`;
  if (result.missingSkills && result.missingSkills.length > 0) {
    result.missingSkills.forEach((item) => {
      md += `- **${item.skill}** (Severity: *${item.importance}*) — _Justification: ${item.reason}_\n`;
    });
  } else {
    md += `- Excellent! No required skills are completely unrepresented in your resume.\n`;
  }

  md += `\n\n--------------------------------------------------\n\n`;

  md += `## 6. Structural & Text Enhancements\n\n`;
  if (result.improvementSuggestions && result.improvementSuggestions.length > 0) {
    result.improvementSuggestions.forEach((sug, idx) => {
      md += `### Recommendation #${idx + 1}: [Section: ${sug.section}]\n`;
      if (sug.currentText) {
        md += `* **Your Current Phrasing**:\n  \`\`\`text\n  ${sug.currentText}\n  \`\`\`\n`;
      }
      md += `* **Optimized Recruiter-Approved Phrasing**:\n  \`\`\`text\n  ${sug.suggestedText}\n  \`\`\`\n`;
      md += `* **Why this change helps alternative algorithms**:\n  ${sug.explanation}\n\n`;
    });
  } else {
    md += `No direct phrasing improvements required.\n\n`;
  }

  md += `--------------------------------------------------\n\n`;

  md += `## 7. Tailored Highly-Actionable Bullet Points\n\n`;
  md += `Directly leverage these high-value action bullet-points within your work histories:\n\n`;
  if (result.tailoredBullets && result.tailoredBullets.length > 0) {
    result.tailoredBullets.forEach((bullet, idx) => {
      md += `### Tailored Bullet #${idx + 1}\n`;
      md += `* **Suggested Wording**:\n  > **${bullet.tailoredBullet}**\n`;
      md += `* **Based on (your original bullet)**:\n  _"${bullet.originalBullet || "N/A"}"_\n`;
      md += `* **Recruiter rationale**:\n  ${bullet.explanation}\n\n`;
    });
  } else {
    md += `No custom bullets generated.\n\n`;
  }

  return md;
}

export function downloadMarkdownFile(content: string, fileName: string = "AI_Resume_Analysis_Report.md") {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
