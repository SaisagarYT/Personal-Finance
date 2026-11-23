import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import {
  Laptop,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Ellipsis,
  Check,
  SquarePen,
  Plus,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

import { StatusSymbol } from '../components/StatusSymbol';

export interface TaskManagerScreenProps {
  onOpenProfile?: () => void;
  onSelectProject?: (projectId: string) => void;
  initialView?: 'overview' | 'detail';
}

// Re-export StatusSymbol as ProjectStatusSymbol for clean backward-compatibility
const ProjectStatusSymbol = StatusSymbol;

/**
 * Circular progress ring with percentage in center,
 * matching the exact progress indicator in Section 3.
 */
interface CircularProgressRingProps {
  size?: number;
  progress: number; // 0 to 1
  color: string;
  trackColor?: string;
}

const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  size = 38,
  progress = 0.75,
  color,
  trackColor = 'rgba(0, 0, 0, 0.06)',
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '700', color, letterSpacing: -0.3 }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

export interface ProjectTaskItem {
  id: string;
  num: number;
  title: string;
  description: string;
  date?: string;
  isDone: boolean;
  isOngoing?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  createdDate: string;
  dueDate: string;
  tasks: ProjectTaskItem[];
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'website-design',
    title: 'Website Design',
    createdDate: '1 Jul',
    dueDate: '12 Jul',
    tasks: [
      {
        id: 'wd-1',
        num: 1,
        title: 'Discovery Call',
        description: 'Understand clients needs & project',
        date: '3 Jul',
        isDone: true,
      },
      {
        id: 'wd-2',
        num: 2,
        title: 'UX Research',
        description: 'Do user research to understand pain points',
        date: '6 Jul',
        isDone: true,
      },
      {
        id: 'wd-3',
        num: 3,
        title: 'Wireframing',
        description: 'Wireframe based on UX research',
        date: '9 Jul',
        isDone: true,
      },
      {
        id: 'wd-4',
        num: 4,
        title: 'Prototype',
        description: 'Prototype to make it interactive',
        isDone: false,
        isOngoing: true,
      },
      {
        id: 'wd-5',
        num: 5,
        title: 'Wireframing',
        description: 'Wireframe based on UX research',
        isDone: false,
      },
    ],
  },
  {
    id: 'ux-research',
    title: 'UX Research',
    createdDate: '2 Jul',
    dueDate: '18 Jul',
    tasks: [
      {
        id: 'ux-1',
        num: 1,
        title: 'Stakeholder Alignment',
        description: 'Identify product goals and target personas',
        date: '3 Jul',
        isDone: true,
      },
      {
        id: 'ux-2',
        num: 2,
        title: 'Competitive Analysis',
        description: 'Audit top 5 competitor interfaces for gaps',
        date: '5 Jul',
        isDone: true,
      },
      {
        id: 'ux-3',
        num: 3,
        title: 'Survey Distribution',
        description: 'Send questionnaire to 150 target users',
        date: '7 Jul',
        isDone: true,
      },
      {
        id: 'ux-4',
        num: 4,
        title: 'User Interviews',
        description: 'Conduct 8 in-depth user interviews',
        date: '8 Jul',
        isDone: true,
      },
      {
        id: 'ux-5',
        num: 5,
        title: 'Affinity Mapping',
        description: 'Cluster qualitative notes into pain points',
        date: '10 Jul',
        isDone: true,
      },
      {
        id: 'ux-6',
        num: 6,
        title: 'Empathy Canvas',
        description: 'Synthesize motivations and daily workflows',
        date: '11 Jul',
        isDone: true,
      },
      {
        id: 'ux-7',
        num: 7,
        title: 'Customer Journey Map',
        description: 'Map full onboarding through checkout journey',
        isDone: false,
        isOngoing: true,
      },
      {
        id: 'ux-8',
        num: 8,
        title: 'Usability Testing',
        description: 'Test interactive prototype with 5 participants',
        isDone: false,
      },
      {
        id: 'ux-9',
        num: 9,
        title: 'Insights Synthesis',
        description: 'Quantify metrics and compile key findings',
        isDone: false,
      },
      {
        id: 'ux-10',
        num: 10,
        title: 'Executive Presentation',
        description: 'Deliver research report to design team',
        isDone: false,
      },
    ],
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    createdDate: '4 Jul',
    dueDate: '20 Jul',
    tasks: [
      {
        id: 'cc-1',
        num: 1,
        title: 'Topic Brainstorming',
        description: 'Select Q3 theme and 10 viral hooks',
        date: '5 Jul',
        isDone: true,
      },
      {
        id: 'cc-2',
        num: 2,
        title: 'Content Strategy',
        description: 'Align keywords and target audiences',
        date: '7 Jul',
        isDone: true,
      },
      {
        id: 'cc-3',
        num: 3,
        title: 'First Article Draft',
        description: 'Write 1,500 word comprehensive guide',
        date: '9 Jul',
        isDone: true,
      },
      {
        id: 'cc-4',
        num: 4,
        title: 'SEO Optimization',
        description: 'Add meta descriptions and header tags',
        date: '10 Jul',
        isDone: true,
      },
      {
        id: 'cc-5',
        num: 5,
        title: 'Custom Illustrations',
        description: 'Design 4 branded diagrams and covers',
        isDone: false,
        isOngoing: true,
      },
      {
        id: 'cc-6',
        num: 6,
        title: 'Editorial Review',
        description: 'Proofread and fact-check all sections',
        isDone: false,
      },
      {
        id: 'cc-7',
        num: 7,
        title: 'CMS Publishing',
        description: 'Format, test links, and schedule post',
        isDone: false,
      },
      {
        id: 'cc-8',
        num: 8,
        title: 'Social Distribution',
        description: 'Broadcast carousel and newsletter blasts',
        isDone: false,
      },
    ],
  },
  {
    id: 'client-project',
    title: 'Client Project',
    createdDate: '28 Jun',
    dueDate: '15 Jul',
    tasks: [
      {
        id: 'cp-1',
        num: 1,
        title: 'Contract Signing',
        description: 'Finalize scope of work and milestones',
        date: '29 Jun',
        isDone: true,
      },
      {
        id: 'cp-2',
        num: 2,
        title: 'Project Kickoff',
        description: 'Align team on roadmap and deadlines',
        date: '1 Jul',
        isDone: true,
      },
      {
        id: 'cp-3',
        num: 3,
        title: 'Architecture Blueprint',
        description: 'Define database schema and auth flows',
        date: '2 Jul',
        isDone: true,
      },
      {
        id: 'cp-4',
        num: 4,
        title: 'Tech Stack Setup',
        description: 'Configure Next.js and Expo environments',
        date: '4 Jul',
        isDone: true,
      },
      {
        id: 'cp-5',
        num: 5,
        title: 'Design System Tokens',
        description: 'Establish typography and color tokens',
        date: '6 Jul',
        isDone: true,
      },
      {
        id: 'cp-6',
        num: 6,
        title: 'Wireframes Delivery',
        description: 'Deliver 12 low-fidelity mobile wireframes',
        date: '7 Jul',
        isDone: true,
      },
      {
        id: 'cp-7',
        num: 7,
        title: 'Client Mid-Check',
        description: 'Demonstrate navigation and feedback',
        date: '8 Jul',
        isDone: true,
      },
      {
        id: 'cp-8',
        num: 8,
        title: 'Backend API Scaffolding',
        description: 'Implement core REST endpoints & models',
        date: '9 Jul',
        isDone: true,
      },
      {
        id: 'cp-9',
        num: 9,
        title: 'Mobile Screens Build',
        description: 'Implement 6 responsive app screens',
        date: '10 Jul',
        isDone: true,
      },
      {
        id: 'cp-10',
        num: 10,
        title: 'Integration Testing',
        description: 'End-to-end testing across devices',
        isDone: false,
        isOngoing: true,
      },
      {
        id: 'cp-11',
        num: 11,
        title: 'Security & Auth Audit',
        description: 'Verify role-based access and encryption',
        isDone: false,
      },
      {
        id: 'cp-12',
        num: 12,
        title: 'Production Launch',
        description: 'Deploy to cloud infra and app stores',
        isDone: false,
      },
    ],
  },
];

interface DailyTaskItem {
  id: string;
  projectTag: string;
  title: string;
  description: string;
  completedTasks: number;
  totalTasks: number;
  progress: number;
  isDone: boolean;
}

const DAILY_TASKS: DailyTaskItem[] = [
  {
    id: 'task-1',
    projectTag: 'UX Research',
    title: 'Complete Competitive Analysis',
    description: 'Analyze top competitor travel sites to identify strength & gaps',
    completedTasks: 6,
    totalTasks: 10,
    progress: 0.75,
    isDone: true,
  },
  {
    id: 'task-2',
    projectTag: 'Client Project',
    title: 'Discuss about Wireframe',
    description: 'Meeting with client to review initial UX wireframes & flow',
    completedTasks: 9,
    totalTasks: 12,
    progress: 0.5,
    isDone: true,
  },
];

export const TaskManagerScreen: React.FC<TaskManagerScreenProps> = ({
  onSelectProject,
  initialView = 'overview',
}) => {
  const theme = useAppTheme();

  // Dynamic projects state: each project owns its own tasks and dates
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('website-design');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);

  // Form inputs for creating a new project
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFirstTask, setNewFirstTask] = useState('');

  // Form inputs for adding a task to the active project
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Active project resolved from state (falls back to first project)
  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Dynamic metrics for the active project
  const activeCompletedCount = activeProject.tasks.filter((t) => t.isDone).length;
  const activeTotalCount = activeProject.tasks.length;

  // Check URL query param ?view=detail on web
  const [currentView, setCurrentView] = useState<'overview' | 'detail'>(() => {
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && (globalThis as any).window) {
      const v = new URLSearchParams((globalThis as any).window.location.search).get('view');
      if (v === 'detail') return 'detail';
    }
    return initialView;
  });

  // Selected calendar day index (defaults to Fri 11 matching the reference image)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(4); // Fri 11

  const weekDays = [
    { day: 'Mon', num: 7 },
    { day: 'Tue', num: 8 },
    { day: 'Wed', num: 9 },
    { day: 'Thu', num: 10 },
    { day: 'Fri', num: 11 },
    { day: 'Sat', num: 12 },
  ];

  // ================= ACTION HANDLERS =================

  // Toggle task completion within the active project
  const handleToggleTask = (taskId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        return {
          ...proj,
          tasks: proj.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const nextDone = !task.isDone;
            return {
              ...task,
              isDone: nextDone,
              isOngoing: false,
              date: nextDone ? (task.date || '11 Jul') : undefined,
            };
          }),
        };
      })
    );
  };

  // Create a brand new project with its own tasks
  const handleCreateProject = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const newId = `proj-${Date.now()}`;
    const initialTaskTitle = newFirstTask.trim() || 'Project Kickoff & Requirements';

    const createdProj: ProjectItem = {
      id: newId,
      title: trimmedTitle,
      createdDate: '11 Jul',
      dueDate: newDueDate.trim() || '30 Jul',
      tasks: [
        {
          id: `${newId}-t1`,
          num: 1,
          title: initialTaskTitle,
          description: 'Initial scope, requirements, and milestones planning',
          isDone: false,
          isOngoing: true,
        },
      ],
    };

    setProjects((prev) => [createdProj, ...prev]);
    setSelectedProjectId(newId);
    setNewTitle('');
    setNewDueDate('');
    setNewFirstTask('');
    setIsCreateModalOpen(false);
    setCurrentView('detail');
  };

  // Add a task to the currently active project
  const handleAddTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const nextNum = proj.tasks.length + 1;
        const newTask: ProjectTaskItem = {
          id: `${proj.id}-t${Date.now()}`,
          num: nextNum,
          title: trimmedTitle,
          description: newTaskDesc.trim() || 'Milestone deliverable',
          isDone: false,
          isOngoing: false,
        };
        return {
          ...proj,
          tasks: [...proj.tasks, newTask],
        };
      })
    );

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddTaskModalOpen(false);
  };

  // ================= RENDER SECTION 4: PROJECT DETAIL VIEW =================
  if (currentView === 'detail') {
    return (
      <View style={[styles.container, { backgroundColor: theme.canvas }]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.canvas }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Detail Top Bar: [Laptop] Active Project Title & Edit / Add Task Icon */}
          <View style={styles.detailHeaderRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCurrentView('overview')}
              style={styles.detailHeaderTitleGroup}
            >
              <ChevronLeft size={20} color={theme.textMain} strokeWidth={2.2} />
              <Laptop size={21} color={theme.textMain} strokeWidth={1.9} />
              <Text style={[styles.detailHeaderTitleText, { color: theme.textMain }]}>
                {activeProject.title}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAddTaskModalOpen(true)}
              style={styles.detailEditButton}
            >
              <SquarePen size={19} color={theme.textMain} strokeWidth={1.9} />
            </TouchableOpacity>
          </View>

          {/* 2-Column Date Banner Card: Created On | Due On */}
          <View
            style={[
              styles.dateBannerCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.dateBannerCol}>
              <Text style={[styles.dateBannerLabel, { color: theme.textDim }]}>Created On</Text>
              <Text style={[styles.dateBannerValue, { color: theme.textMain }]}>
                {activeProject.createdDate}
              </Text>
            </View>

            <View style={[styles.dateBannerDivider, { backgroundColor: theme.borderSubtle }]} />

            <View style={styles.dateBannerCol}>
              <Text style={[styles.dateBannerLabel, { color: theme.textDim }]}>Due On</Text>
              <Text style={[styles.dateBannerValue, { color: theme.textMain }]}>
                {activeProject.dueDate}
              </Text>
            </View>
          </View>

          {/* Status Summary: ✳ x/y completed (dynamically computed) */}
          <View style={styles.detailStatusRow}>
            <ProjectStatusSymbol size={14} color={theme.textDim} />
            <Text style={[styles.detailStatusText, { color: theme.textMain }]}>
              {activeCompletedCount}/{activeTotalCount} completed
            </Text>
          </View>

          {/* Full-width Divider Line between status summary and table */}
          <View style={[styles.detailSectionDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Tasks Table Header: Task | Description | Status */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableColTaskHeader}>
              <Text style={[styles.tableColHeaderText, { color: theme.textDim }]}>Task</Text>
            </View>
            <View style={styles.tableColDescHeader}>
              <Text style={[styles.tableColHeaderText, { color: theme.textDim }]}>Description</Text>
            </View>
            <View style={styles.tableColStatusHeader}>
              <Text style={[styles.tableColHeaderText, { color: theme.textDim }]}>Status</Text>
            </View>
          </View>

          {/* Tasks Checklist Rows with Continuous Vertical Timeline Spine */}
          <View style={styles.detailTasksContainer}>
            {activeProject.tasks.map((task, index) => {
              const isFirst = index === 0;
              const isLast = index === activeProject.tasks.length - 1;

              return (
                <View
                  key={task.id}
                  style={styles.detailTaskRow}
                >
                  {/* Column 1: Number Stepper with Continuous Vertical Line */}
                  <View style={styles.taskNumColumn}>
                    {/* Vertical Timeline Spine Line (continuous through circle center) */}
                    <View
                      style={[
                        styles.timelineSpine,
                        {
                          backgroundColor: theme.borderSubtle,
                          top: isFirst ? 13 : -11,
                          bottom: isLast ? undefined : -11,
                          height: isLast ? 24 : undefined,
                        },
                      ]}
                    />

                    {/* Stepper Circle */}
                    <View
                      style={[
                        styles.taskNumCircle,
                        task.isOngoing
                          ? {
                              backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                              borderColor: theme.isDark ? '#23F07D' : '#10B981',
                            }
                          : {
                              backgroundColor: theme.surface,
                              borderColor: theme.borderSubtle,
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.taskNumText,
                          {
                            color: task.isOngoing
                              ? (theme.isDark ? '#07170D' : '#FFFFFF')
                              : theme.textDim,
                          },
                        ]}
                      >
                        {task.num}
                      </Text>
                    </View>

                    {/* Optional "Ongoing" badge below the active circle */}
                    {task.isOngoing && (
                      <Text style={[styles.ongoingLabel, { color: theme.textDim }]}>
                        Ongoing
                      </Text>
                    )}
                  </View>

                  {/* Column 2: Title & Description */}
                  <View style={styles.taskDescColumn}>
                    <Text
                      style={[styles.detailTaskTitle, { color: theme.textMain }]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <Text
                      style={[styles.detailTaskDesc, { color: theme.textDim }]}
                      numberOfLines={2}
                    >
                      {task.description}
                    </Text>
                  </View>

                  {/* Column 3: Interactive Checkbox & Date centered */}
                  <View style={styles.taskStatusColumn}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleTask(task.id)}
                      style={[
                        styles.detailCheckbox,
                        {
                          borderColor: theme.borderSubtle,
                          backgroundColor: task.isDone
                            ? (theme.isDark ? '#23F07D' : '#10B981')
                            : theme.surface,
                        },
                      ]}
                    >
                      {task.isDone && (
                        <Check
                          size={13}
                          color={theme.isDark ? '#07170D' : '#FFFFFF'}
                          strokeWidth={2.6}
                        />
                      )}
                    </TouchableOpacity>
                    {task.date ? (
                      <Text style={[styles.detailTaskDate, { color: theme.textDim }]}>
                        {task.date}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Milestone / Task Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAddTaskModalOpen(true)}
            style={[
              styles.addMilestoneButton,
              {
                borderColor: theme.borderSubtle,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Plus size={15} color={theme.textMain} strokeWidth={2.2} />
            <Text style={[styles.addMilestoneText, { color: theme.textMain }]}>
              Add Task to {activeProject.title}
            </Text>
          </TouchableOpacity>

          {/* Spacing for floating capsule dock */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal: Add Task to Active Project */}
        <Modal
          visible={isAddTaskModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAddTaskModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitleText, { color: theme.textMain }]}>
                  Add Milestone / Task
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsAddTaskModalOpen(false)}
                >
                  <X size={20} color={theme.textDim} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubText, { color: theme.textDim }]}>
                Adding milestone to {activeProject.title}
              </Text>

              {/* Task Title Input */}
              <Text style={[styles.inputLabel, { color: theme.textDim }]}>Task Title</Text>
              <TextInput
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="e.g. Design System Tokens"
                placeholderTextColor={theme.textDim}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
              />

              {/* Task Description Input */}
              <Text style={[styles.inputLabel, { color: theme.textDim }]}>Description</Text>
              <TextInput
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
                placeholder="e.g. Set up typography and responsive spacing"
                placeholderTextColor={theme.textDim}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
              />

              {/* Modal Buttons */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsAddTaskModalOpen(false)}
                  style={[
                    styles.modalCancelBtn,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.modalCancelBtnText, { color: theme.textDim }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAddTask}
                  style={[
                    styles.modalPrimaryBtn,
                    {
                      backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalPrimaryBtnText,
                      { color: theme.isDark ? '#07170D' : '#FFFFFF' },
                    ]}
                  >
                    Add Task
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ================= RENDER SECTIONS 1, 2, 3: PROJECTS OVERVIEW =================
  return (
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.canvas }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* ================= SECTION 1: HEADER & CALENDAR WEEK STRIP ================= */}
      
      {/* 1. Header: Laptop Icon + "Projects" & "July, 2025 ▾" Card */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Laptop size={21} color={theme.textMain} strokeWidth={1.9} />
          <Text style={[styles.headerTitleText, { color: theme.textMain }]}>Projects</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.monthCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.monthCardText, { color: theme.textMain }]}>July, 2025</Text>
          <ChevronDown size={14} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* 2. Calendar Horizontal Week Strip */}
      <View style={styles.calendarStripRow}>
        <TouchableOpacity
          style={[
            styles.circularNavButton,
            {
              borderColor: theme.borderSubtle,
              backgroundColor: theme.surface,
            },
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>

        {/* Days of the Week */}
        <View style={styles.daysRowContainer}>
          {weekDays.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => setSelectedDayIndex(idx)}
                style={[
                  styles.dayColumn,
                  isSelected && [
                    styles.dayCardSelected,
                    {
                      backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                      borderColor: theme.isDark ? '#23F07D' : '#059669',
                    },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isSelected
                        ? (theme.isDark ? '#07170D' : '#FFFFFF')
                        : theme.textDim,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    {
                      color: isSelected
                        ? (theme.isDark ? '#07170D' : '#FFFFFF')
                        : theme.textMain,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {item.num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.circularNavButton,
            {
              borderColor: theme.borderSubtle,
              backgroundColor: theme.surface,
            },
          ]}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ================= SECTION 2: PINNED PROJECTS 2x2 GRID ================= */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleGroup}>
          <Folder size={18} color={theme.textMain} strokeWidth={1.8} />
          <Text style={[styles.sectionTitleText, { color: theme.textMain }]}>Pinned Project</Text>
        </View>

        <View style={styles.sectionHeaderActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsCreateModalOpen(true)}
            style={[
              styles.createProjectHeaderBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Plus size={13} color={theme.textMain} strokeWidth={2.4} />
            <Text style={[styles.createProjectHeaderBtnText, { color: theme.textMain }]}>New</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.seeAllButton}
          >
            <Text style={[styles.seeAllText, { color: theme.textDim }]}>See All</Text>
            <ChevronRight size={14} color={theme.textDim} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2x2 Project Cards Grid (Dynamic from projects state) */}
      <View style={styles.projectsGrid}>
        {projects.map((project) => {
          const completedCount = project.tasks.filter((t) => t.isDone).length;
          const totalCount = project.tasks.length;

          return (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedProjectId(project.id);
                onSelectProject?.(project.id);
                setCurrentView('detail');
              }}
              style={[
                styles.projectCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Card Top Row: Folder Icon + Ellipsis */}
              <View style={styles.projectCardTopRow}>
                <Folder size={20} color={theme.textMain} strokeWidth={1.7} />
                <TouchableOpacity activeOpacity={0.6} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ellipsis size={17} color={theme.textDim} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Card Title */}
              <Text
                style={[styles.projectTitle, { color: theme.textMain }]}
                numberOfLines={1}
              >
                {project.title}
              </Text>

              {/* Card Progress / Status with theme color */}
              <View style={styles.projectProgressRow}>
                <ProjectStatusSymbol size={13} color={theme.textDim} />
                <Text style={[styles.projectProgressText, { color: theme.textDim }]}>
                  {completedCount}/{totalCount} completed
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= SECTION 3: TASK LIST WITH TODAY DROPDOWN ================= */}
      <View style={styles.taskSectionHeaderRow}>
        <View style={styles.taskHeaderLeft}>
          <Text style={[styles.taskHeaderTitle, { color: theme.textMain }]}>Task</Text>
          <View style={[styles.taskCountBadge, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.taskCountBadgeText, { color: theme.textDim }]}>
              {DAILY_TASKS.length + 1}
            </Text>
          </View>
        </View>

        {/* "Today ▾" Dropdown Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.todayDropdownCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.todayDropdownText, { color: theme.textMain }]}>Today</Text>
          <ChevronDown size={14} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Task Cards List */}
      <View style={styles.tasksListContainer}>
        {DAILY_TASKS.map((task) => {
          return (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Task Top Row: Project Tag + Checkbox */}
              <View style={styles.taskCardTopRow}>
                <Text style={[styles.taskProjectTag, { color: theme.textDim }]}>
                  {task.projectTag}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.checkboxContainer,
                    {
                      borderColor: theme.borderSubtle,
                      backgroundColor: theme.surfaceSubtle,
                    },
                  ]}
                >
                  {task.isDone && (
                    <Check size={13} color={theme.textMain} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Task Title */}
              <Text style={[styles.taskTitle, { color: theme.textMain }]}>
                {task.title}
              </Text>

              {/* Task Description */}
              <Text style={[styles.taskDescription, { color: theme.textDim }]}>
                {task.description}
              </Text>

              {/* Task Bottom Status Row: Sunburst Progress + Circular Ring */}
              <View style={styles.taskBottomRow}>
                <View style={styles.taskProgressLeft}>
                  <ProjectStatusSymbol size={13} color={theme.textDim} />
                  <Text style={[styles.taskProgressText, { color: theme.textDim }]}>
                    {task.completedTasks}/{task.totalTasks} completed
                  </Text>
                </View>

                {/* Circular Percentage Ring using Theme Color */}
                <CircularProgressRing
                  size={36}
                  progress={task.progress}
                  color={theme.isDark ? '#23F07D' : '#10B981'}
                  trackColor={theme.borderSubtle}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Spacing for floating capsule dock */}
      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Modal: Create New Project */}
    <Modal
      visible={isCreateModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsCreateModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalTitleText, { color: theme.textMain }]}>
              Create New Project
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsCreateModalOpen(false)}
            >
              <X size={20} color={theme.textDim} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubText, { color: theme.textDim }]}>
            Set up a project with its own tasks and milestones
          </Text>

          {/* Project Title Input */}
          <Text style={[styles.inputLabel, { color: theme.textDim }]}>Project Name</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g. Mobile App Redesign"
            placeholderTextColor={theme.textDim}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.borderSubtle,
                color: theme.textMain,
              },
            ]}
          />

          {/* Due Date Input */}
          <Text style={[styles.inputLabel, { color: theme.textDim }]}>Due Date</Text>
          <TextInput
            value={newDueDate}
            onChangeText={setNewDueDate}
            placeholder="e.g. 28 Jul"
            placeholderTextColor={theme.textDim}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.borderSubtle,
                color: theme.textMain,
              },
            ]}
          />

          {/* First Milestone / Task Input */}
          <Text style={[styles.inputLabel, { color: theme.textDim }]}>First Milestone / Task</Text>
          <TextInput
            value={newFirstTask}
            onChangeText={setNewFirstTask}
            placeholder="e.g. Kickoff & Architecture Blueprint"
            placeholderTextColor={theme.textDim}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.borderSubtle,
                color: theme.textMain,
              },
            ]}
          />

          {/* Modal Buttons */}
          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsCreateModalOpen(false)}
              style={[
                styles.modalCancelBtn,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.modalCancelBtnText, { color: theme.textDim }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateProject}
              style={[
                styles.modalPrimaryBtn,
                {
                  backgroundColor: theme.isDark ? '#23F07D' : '#10B981',
                },
              ]}
            >
              <Text
                style={[
                  styles.modalPrimaryBtnText,
                  { color: theme.isDark ? '#07170D' : '#FFFFFF' },
                ]}
              >
                Create Project
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 24,
  },
  // Section 1 Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthCardText: {
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  calendarStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  circularNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 4,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 36,
  },
  dayCardSelected: {
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dayLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 14.5,
  },
  // Section 2: Pinned Projects
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 24,
  },
  projectCard: {
    width: '48.2%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  projectCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  projectProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  projectProgressText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  // Section 3: Task List
  taskSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  taskHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  taskCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  taskCountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayDropdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todayDropdownText: {
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tasksListContainer: {
    gap: 12,
    marginBottom: 20,
  },
  taskCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  taskCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskProjectTag: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  taskBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  taskProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taskProgressText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  // Section 4: Detail View Styles
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailHeaderTitleText: {
    fontSize: 18.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  detailEditButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 22,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dateBannerCol: {
    flex: 1,
  },
  dateBannerLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateBannerValue: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  dateBannerDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 16,
  },
  detailStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  detailStatusText: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  detailSectionDivider: {
    width: '100%',
    height: 1,
    marginVertical: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  tableColTaskHeader: {
    width: 36,
    alignItems: 'center',
  },
  tableColDescHeader: {
    flex: 1,
    marginLeft: 14,
  },
  tableColStatusHeader: {
    width: 52,
    alignItems: 'center',
  },
  tableColHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailTasksContainer: {
    width: '100%',
    marginTop: 2,
  },
  detailTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 11,
    position: 'relative',
  },
  taskNumColumn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    minHeight: 52,
  },
  timelineSpine: {
    position: 'absolute',
    left: '50%',
    width: 1.5,
    transform: [{ translateX: -0.75 }],
    zIndex: 1,
  },
  taskNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  taskNumText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  ongoingLabel: {
    fontSize: 8.5,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
    zIndex: 2,
  },
  taskDescColumn: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
    paddingTop: 1,
  },
  detailTaskTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  detailTaskDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  taskStatusColumn: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  detailCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  detailTaskDate: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  // Section 2 Header Actions & Dynamic Project Creation
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createProjectHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  createProjectHeaderBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  // Add Milestone Button (Detail View)
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
  },
  addMilestoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Themed Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalSubText: {
    fontSize: 12,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  modalPrimaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
