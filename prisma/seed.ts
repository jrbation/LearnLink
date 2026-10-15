import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LearnLink database seed...");

  // 1. Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.teacherMessage.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.response.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.answerChoice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.parentChild.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const defaultPasswordHash = await hash("Demo1234!", 10);

  // 3. Create Users
  const teacher = await prisma.user.create({
    data: {
      email: "teacher@learnlink.demo",
      passwordHash: defaultPasswordHash,
      name: "Ms. Sarah Johnson",
      role: "TEACHER",
      bio: "High school literature and humanities educator with 8 years of teaching experience.",
      phone: "+1 (555) 234-5678",
      emailVerified: new Date(),
    },
  });

  const studentAlex = await prisma.user.create({
    data: {
      email: "student@learnlink.demo",
      passwordHash: defaultPasswordHash,
      name: "Alex Rivera",
      role: "STUDENT",
      bio: "Grade 10 student passionate about literature, history, and robotics.",
      emailVerified: new Date(),
    },
  });

  const studentMaria = await prisma.user.create({
    data: {
      email: "student2@learnlink.demo",
      passwordHash: defaultPasswordHash,
      name: "Maria Santos",
      role: "STUDENT",
      bio: "Grade 10 honors student interested in mathematics and creative writing.",
      emailVerified: new Date(),
    },
  });

  const parentRobert = await prisma.user.create({
    data: {
      email: "parent@learnlink.demo",
      passwordHash: defaultPasswordHash,
      name: "Robert Rivera",
      role: "PARENT",
      phone: "+1 (555) 876-5432",
      bio: "Parent of Alex Rivera. Dedicated to supporting high-quality education.",
      emailVerified: new Date(),
    },
  });

  console.log("✓ Created 4 demo accounts (Teacher, 2 Students, 1 Parent)");

  // 4. Link Parent to Alex Rivera
  await prisma.parentChild.create({
    data: {
      parentId: parentRobert.id,
      childId: studentAlex.id,
      status: "ACTIVE",
    },
  });

  console.log("✓ Established Parent-Child link (Robert Rivera -> Alex Rivera)");

  // 5. Create Classes
  const englishClass = await prisma.class.create({
    data: {
      name: "English Literature 101",
      subject: "English Language Arts",
      gradeLevel: "Grade 10",
      section: "Section A",
      description: "Exploration of classical literature, dramatic texts, poetic devices, and analytical essay writing.",
      enrollmentCode: "ENG101",
      status: "ACTIVE",
      teacherId: teacher.id,
    },
  });

  const mathClass = await prisma.class.create({
    data: {
      name: "Advanced Algebra 201",
      subject: "Mathematics",
      gradeLevel: "Grade 10",
      section: "Section B",
      description: "Comprehensive algebra covering polynomials, quadratic functions, rational expressions, and graph theory.",
      enrollmentCode: "MATH201",
      status: "ACTIVE",
      teacherId: teacher.id,
    },
  });

  console.log("✓ Created 2 classes: English Literature 101 & Advanced Algebra 201");

  // 6. Enroll Students
  await prisma.enrollment.createMany({
    data: [
      { classId: englishClass.id, studentId: studentAlex.id, status: "ACTIVE" },
      { classId: englishClass.id, studentId: studentMaria.id, status: "ACTIVE" },
      { classId: mathClass.id, studentId: studentAlex.id, status: "ACTIVE" },
    ],
  });

  console.log("✓ Enrolled Alex & Maria in English, and Alex in Math");

  // 7. Create Lessons & Materials
  const lesson1 = await prisma.lesson.create({
    data: {
      classId: englishClass.id,
      title: "Introduction to Shakespearean Tragedy: Macbeth",
      description: "Historical context of Jacobean drama, tragic flaws, and central themes of ambition and fate.",
      content: `### Welcome to Macbeth!

In this unit, we will examine William Shakespeare's iconic tragedy *Macbeth*. 

#### Key Discussion Points:
1. **The Tragic Hero & Hamartia:** How does Macbeth's unchecked ambition lead to moral decay?
2. **The Supernatural:** The role of the Weird Sisters as catalysts versus agents of destiny.
3. **Equivocation & Deception:** "Fair is foul, and foul is fair."

Please review the attached reading guide before our live remote discussion on Friday.`,
      status: "PUBLISHED",
      order: 1,
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.material.create({
    data: {
      lessonId: lesson1.id,
      fileName: "Macbeth_Historical_Context_Study_Guide.pdf",
      fileUrl: "/sample-materials/macbeth-guide.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 450, // 450 KB
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      classId: englishClass.id,
      title: "Analyzing Metaphor & Imagery in Romantic Poetry",
      description: "Deep dive into William Wordsworth and John Keats with an emphasis on sensory language.",
      content: "Examine how romantic poets reflected human emotion onto the natural landscape.",
      status: "PUBLISHED",
      order: 2,
      publishedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  const lessonMath = await prisma.lesson.create({
    data: {
      classId: mathClass.id,
      title: "Quadratic Functions & The Vertex Form",
      description: "Mastering parabola vertex calculation, axes of symmetry, and quadratic transformations.",
      content: "Learn how f(x) = a(x - h)^2 + k translates in 2D Euclidean coordinate space.",
      status: "PUBLISHED",
      order: 1,
      publishedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  console.log("✓ Created 3 published lessons with study materials");

  // 8. Create Quizzes & Assignments
  const quiz = await prisma.assignment.create({
    data: {
      classId: englishClass.id,
      title: "Macbeth Act 1 Reading Comprehension Quiz",
      description: "Assess understanding of character motives, prophecies, and key dialogue in Act 1.",
      instructions: "Answer all 3 questions. Multiple choice selections are saved automatically. Time limit is 25 minutes.",
      type: "QUIZ",
      status: "PUBLISHED",
      totalPoints: 100,
      timeLimitMinutes: 25,
      dueDate: new Date(Date.now() + 4 * 86400000),
      publishDate: new Date(Date.now() - 2 * 86400000),
      allowLate: false,
    },
  });

  // Question 1 (MCQ)
  const q1 = await prisma.question.create({
    data: {
      assignmentId: quiz.id,
      text: "What prophecy do the three witches give Macbeth in Act 1, Scene 3?",
      type: "MULTIPLE_CHOICE",
      points: 30,
      order: 1,
    },
  });

  const q1Choice1 = await prisma.answerChoice.create({
    data: { questionId: q1.id, text: "He will become Thane of Cawdor and King hereafter", isCorrect: true, order: 1 },
  });
  await prisma.answerChoice.create({
    data: { questionId: q1.id, text: "He will lead an army to conquer England", isCorrect: false, order: 2 },
  });
  await prisma.answerChoice.create({
    data: { questionId: q1.id, text: "He will be crowned Emperor of Rome", isCorrect: false, order: 3 },
  });
  await prisma.answerChoice.create({
    data: { questionId: q1.id, text: "His descendants will immediately sit on the throne", isCorrect: false, order: 4 },
  });

  // Question 2 (MCQ)
  const q2 = await prisma.question.create({
    data: {
      assignmentId: quiz.id,
      text: "Which character famously questions Macbeth's masculinity to spur him toward regicide?",
      type: "MULTIPLE_CHOICE",
      points: 30,
      order: 2,
    },
  });

  const q2Choice1 = await prisma.answerChoice.create({
    data: { questionId: q2.id, text: "Lady Macbeth", isCorrect: true, order: 1 },
  });
  await prisma.answerChoice.create({
    data: { questionId: q2.id, text: "Banquo", isCorrect: false, order: 2 },
  });
  await prisma.answerChoice.create({
    data: { questionId: q2.id, text: "Macduff", isCorrect: false, order: 3 },
  });

  // Question 3 (Short Answer / Essay)
  const q3 = await prisma.question.create({
    data: {
      assignmentId: quiz.id,
      text: "Explain the symbolic significance of the phrase 'Fair is foul, and foul is fair' in 2-3 sentences.",
      type: "SHORT_ANSWER",
      points: 40,
      order: 3,
    },
  });

  // Math Assignment
  const mathAssignment = await prisma.assignment.create({
    data: {
      classId: mathClass.id,
      title: "Problem Set 4: Quadratic Modeling",
      description: "Solve real-world projectile motion problems using the quadratic vertex formula.",
      instructions: "Submit your step-by-step solutions with work clearly displayed.",
      type: "ASSIGNMENT",
      status: "PUBLISHED",
      totalPoints: 100,
      dueDate: new Date(Date.now() + 6 * 86400000),
      publishDate: new Date(Date.now() - 1 * 86400000),
      allowLate: true,
    },
  });

  console.log("✓ Created Macbeth Quiz (with questions & choices) and Math Problem Set");

  // 9. Submissions and Released Grades for Alex Rivera
  const alexSubmission = await prisma.submission.create({
    data: {
      assignmentId: quiz.id,
      studentId: studentAlex.id,
      status: "GRADED",
      submittedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.response.createMany({
    data: [
      { submissionId: alexSubmission.id, questionId: q1.id, selectedChoiceId: q1Choice1.id },
      { submissionId: alexSubmission.id, questionId: q2.id, selectedChoiceId: q2Choice1.id },
      {
        submissionId: alexSubmission.id,
        questionId: q3.id,
        answerText: "The phrase establishes the pervasive theme of moral inversion and deceit throughout the play. What appears good and honorable on the surface often conceals deadly corruption and treacherous intent.",
      },
    ],
  });

  await prisma.grade.create({
    data: {
      submissionId: alexSubmission.id,
      score: 95,
      maxScore: 100,
      percentage: 95,
      feedback: "Outstanding work, Alex! Your literary analysis of equivocation in Question 3 was insightful and well-supported.",
      gradedById: teacher.id,
      gradedAt: new Date(Date.now() - 12 * 3600000),
    },
  });

  // Maria's Submission (Pending Grade)
  const mariaSubmission = await prisma.submission.create({
    data: {
      assignmentId: quiz.id,
      studentId: studentMaria.id,
      status: "SUBMITTED",
      submittedAt: new Date(Date.now() - 6 * 3600000),
    },
  });

  await prisma.response.createMany({
    data: [
      { submissionId: mariaSubmission.id, questionId: q1.id, selectedChoiceId: q1Choice1.id },
      { submissionId: mariaSubmission.id, questionId: q2.id, selectedChoiceId: q2Choice1.id },
      {
        submissionId: mariaSubmission.id,
        questionId: q3.id,
        answerText: "It means things are not always what they seem, and good things can turn bad.",
      },
    ],
  });

  console.log("✓ Recorded submissions: Alex (Graded 95%) and Maria (Submitted, pending teacher review)");

  // 10. Class Schedules & Remote Sessions
  const schedule1 = await prisma.schedule.create({
    data: {
      classId: englishClass.id,
      title: "Live Lecture: Macbeth Motifs & Soliloquies",
      description: "Interactive line-by-line reading of the 'Tomorrow, and tomorrow, and tomorrow' soliloquy.",
      startTime: new Date(Date.now() + 1 * 86400000 + 10 * 3600000), // Tomorrow at 10 AM
      endTime: new Date(Date.now() + 1 * 86400000 + 11 * 3600000),
      meetingLink: "https://meet.google.com/abc-learnlink-demo",
      status: "SCHEDULED",
    },
  });

  const pastSchedule = await prisma.schedule.create({
    data: {
      classId: englishClass.id,
      title: "Introduction to Jacobean England",
      description: "Historical and political background of King James I and the Gunpowder Plot.",
      startTime: new Date(Date.now() - 2 * 86400000 + 9 * 3600000),
      endTime: new Date(Date.now() - 2 * 86400000 + 10 * 3600000),
      meetingLink: "https://meet.google.com/abc-learnlink-past",
      status: "COMPLETED",
    },
  });

  // 11. Attendance Records
  await prisma.attendance.createMany({
    data: [
      {
        scheduleId: pastSchedule.id,
        studentId: studentAlex.id,
        status: "PRESENT",
        notes: "Participated actively in class discussion",
        markedById: teacher.id,
      },
      {
        scheduleId: pastSchedule.id,
        studentId: studentMaria.id,
        status: "PRESENT",
        notes: "On time and prepared",
        markedById: teacher.id,
      },
    ],
  });

  console.log("✓ Created upcoming remote class schedule & past attendance records");

  // 12. Announcements (including the canonical Parent Announcement Board example)
  await prisma.announcement.createMany({
    data: [
      {
        classId: englishClass.id,
        teacherId: teacher.id,
        title: "Class Announcement: English Remote Class Schedule Change",
        message: "Our English remote class has been moved to Friday at 9:00 AM. Please remind your child to join on time.",
        targetAudience: "all",
        isPinned: true,
        publishedAt: new Date(Date.now() - 4 * 3600000),
      },
      {
        classId: englishClass.id,
        teacherId: teacher.id,
        title: "Upcoming Macbeth Unit Examination",
        message: "The Act 1-3 comprehensive exam is scheduled for two weeks from today. Please check the study guide under Class Materials.",
        targetAudience: "all",
        isPinned: false,
        publishedAt: new Date(Date.now() - 24 * 3600000),
      },
      {
        classId: mathClass.id,
        teacherId: teacher.id,
        title: "Parent-Teacher Conference Notice",
        message: "Quarter 1 conferences will be held virtually next Tuesday evening. Booking slots will open tomorrow.",
        targetAudience: "parents",
        isPinned: false,
        publishedAt: new Date(Date.now() - 48 * 3600000),
      },
    ],
  });

  console.log("✓ Created 3 Announcements (including Parent Announcement Board example)");

  // 13. Notifications for All Roles
  await prisma.notification.createMany({
    data: [
      // Parent notifications
      {
        userId: parentRobert.id,
        title: "New Announcement: English Remote Class Schedule Change",
        message: "Ms. Sarah Johnson published a schedule update for English Literature 101.",
        type: "ANNOUNCEMENT",
        link: "/dashboard/parent/announcements",
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 3600000),
      },
      {
        userId: parentRobert.id,
        title: "Grade Released: Alex Rivera",
        message: "Alex received 95% on Macbeth Act 1 Reading Comprehension Quiz.",
        type: "GRADE_RELEASED",
        link: "/dashboard/parent/progress",
        isRead: true,
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
      // Student notifications
      {
        userId: studentAlex.id,
        title: "Grade Released: Macbeth Act 1 Quiz",
        message: "Your score: 95/100 (95%). Feedback: Outstanding work, Alex!",
        type: "GRADE_RELEASED",
        link: "/dashboard/student/grades",
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
      {
        userId: studentAlex.id,
        title: "Upcoming Class Tomorrow",
        message: "Live Lecture: Macbeth Motifs & Soliloquies starts tomorrow at 10:00 AM.",
        type: "SCHEDULE_CHANGE",
        link: "/dashboard/student/schedule",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      // Teacher notifications
      {
        userId: teacher.id,
        title: "New Student Submission",
        message: "Maria Santos submitted Macbeth Act 1 Reading Comprehension Quiz.",
        type: "SUBMISSION",
        link: "/dashboard/teacher/submissions",
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 3600000),
      },
    ],
  });

  console.log("✓ Seeded realistic notifications across Teacher, Student, and Parent accounts");
  console.log("🎉 LearnLink database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
