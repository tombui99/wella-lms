import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CourseManagementComponent } from './course-management/course-management.component';
import { LessonEditComponent } from './lesson-edit/lesson-edit.component';
import { authGuard } from './core/auth/auth.guard';
import { teacherGuard } from './core/auth/teacher.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'courses/manage',
    component: CourseManagementComponent,
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/analytics',
    loadComponent: () =>
      import('./teacher-analytics/teacher-analytics.component').then(
        (m) => m.TeacherAnalyticsComponent,
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'courses/:courseId/lessons/add',
    component: LessonEditComponent,
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'courses/:courseId/lessons/:lessonId/edit',
    component: LessonEditComponent,
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'courses/:courseId/quiz/manage',
    loadComponent: () => import('./quiz-edit/quiz-edit.component').then((m) => m.QuizEditComponent),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'student/courses',
    loadComponent: () =>
      import('./student-courses/student-courses.component').then((m) => m.StudentCoursesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'student/courses/:courseId',
    loadComponent: () =>
      import('./student-course-detail/student-course-detail.component').then(
        (m) => m.StudentCourseDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'student/courses/:courseId/quiz/:quizId',
    loadComponent: () =>
      import('./student-quiz/student-quiz.component').then((m) => m.StudentQuizComponent),
    canActivate: [authGuard],
  },
  {
    path: 'student/schedule',
    loadComponent: () =>
      import('./student-schedule/student-schedule.component').then(
        (m) => m.StudentScheduleComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'teacher/schedules',
    loadComponent: () =>
      import('./teacher-schedule-management/teacher-schedule-management.component').then(
        (m) => m.TeacherScheduleManagementComponent,
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/user-management.component').then((m) => m.UserManagementComponent),
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./admin/tenant-management.component').then((m) => m.TenantManagementComponent),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./admin/content-management.component').then((m) => m.ContentManagementComponent),
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: '**', redirectTo: 'dashboard' },
];
