import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Question, QuestionType } from '../types';

export const exportExamToWord = async (title: string, questions: Question[], includeAnswers = false) => {
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  questions.forEach((q, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${q.text} (${q.type === QuestionType.SINGLE_CHOICE ? '单选' : q.type === QuestionType.MULTIPLE_CHOICE ? '多选' : '判断'})`,
            bold: true,
          }),
        ],
        spacing: { before: 200, after: 120 },
      })
    );

    if (q.options) {
      q.options.forEach((opt, optIdx) => {
        const label = String.fromCharCode(65 + optIdx);
        children.push(
          new Paragraph({
            text: `${label}. ${opt}`,
            indent: { left: 720 },
          })
        );
      });
    }

    if (includeAnswers) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `正确答案: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}`,
              color: '2D7A50',
              bold: true,
            }),
          ],
          spacing: { before: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `解析: ${q.explanation}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
};
