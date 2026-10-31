# EnglishQuiz Database Schemas (MongoDB & Mongoose)

## 1. User Schema (\models/User.js\)
- \
ame\ (String, required)
- \email\ (String, required, unique)
- \password\ (String, hashed with bcrypt)
- \ole\ (Enum: ["Student", "Teacher", "Admin"], default: "Student")
- \status\ (Enum: ["Active", "Disabled"], default: "Active")
- \ge\, \ddress\, \school\
- \studentProfile\: \{ targetCertificate, targetScore }\
- \	eacherProfile\: \{ specialization, experienceYears, bio }\

## 2. Question Schema (\models/Question.js\)
- \content\ (String, required)
- \options\ ([String], cho MultipleChoice)
- \correctAnswer\ (Mixed: number index, string, boolean)
- \level\ (Enum: ["A1", "A2", "B1", "B2", "C1", "C2", "easy", "medium", "hard"])
- \questionType\ (Enum: ["MultipleChoice", "FillInBlank", "TrueFalse", "Matching"])
- \	opic\, \skill\, \certificate\ (ObjectId references)
- \matchingPairs\: \[{ left: String, right: String }]\
- \passage\ (String, đoạn văn đọc hiểu)
- \udioUrl\ (String, link phát âm bài nghe)
- \explanation\ (String, giải thích đáp án)

## 3. Exam Schema (\models/Exam.js\)
- \	itle\ (String, required)
- \duration\ (Number, số phút làm bài)
- \	ype\ (Enum: ["practice", "quiz", "minitest", "mock_test"])
- \level\ (String, default: "Mixed")
- \questions\ ([ObjectId ref Question])
- \	opic\, \certificate\, \skills\
- \createdBy\ (ObjectId ref User)

## 4. History Schema (\models/History.js\)
- \userId\ (ObjectId ref User)
- \examId\ (ObjectId ref Exam)
- \score\ (Number)
- \	otal\ (Number)
- \status\ ("PASSED" | "FAILED")
- \nswers\: \[{ questionId: String, selectedAnswer: String }]\

## 5. Flashcard Schema (\models/Flashcard.js\)
- \userId\ (ObjectId ref User)
- \word\, \definition\, \example\, \pronunciation\
- \	ype\ (Enum: ["vocabulary", "grammar", "collocation", "idiom"])
- \ox\ (Number, 1 to 5 - Leitner system)
- \
extReviewDate\ (Date, thời điểm ôn tập tiếp theo)

## 6. Bookmark Schema (\models/Bookmark.js\)
- \userId\ (ObjectId ref User)
- \itemType\ (Enum: ["Question", "Exam"])
- \itemId\ (ObjectId ref Question hoặc Exam)
- \
otes\ (String)
