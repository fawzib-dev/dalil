# Dalil Content

The starter question bank lives in `lib/data.ts` so the app can run without a database. It follows the same shape as the production `questions` and `evidence` tables in `supabase/schema.sql`.

Every item must move through this workflow before it is shown to users:

1. `draft`
2. `needs-verification`
3. `verified`
4. `published`

Qur'an wording, Arabic text, translation, hadith wording, collection, number, and grade should be checked by a qualified reviewer. AI may assist with draft creation, but it must not publish Islamic content automatically.

Question shape:

```json
{
  "id": "sunnah-001",
  "topicId": "following-the-prophet",
  "lessonId": "following-the-prophet-2",
  "difficulty": "easy",
  "type": "multiple-choice",
  "question": "What does this ayah teach?",
  "evidence": {
    "type": "quran",
    "arabic": "...",
    "translation": "...",
    "reference": "An-Nisa 4:80"
  },
  "answers": [
    { "id": "a", "text": "..." },
    { "id": "b", "text": "..." }
  ],
  "correctAnswer": "a",
  "explanation": "...",
  "xp": 100,
  "verification": {
    "status": "needs-verification",
    "quranReferenceChecked": false,
    "arabicChecked": false,
    "translationChecked": false,
    "hadithReferenceChecked": false,
    "hadithGradeChecked": false
  }
}
```
