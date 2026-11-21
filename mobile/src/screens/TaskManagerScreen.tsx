import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
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
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

export interface TaskManagerScreenProps {
  onOpenProfile?: () => void;
  onSelectProject?: (projectId: string) => void;
}

/**
 * 8-ray sunburst / asterisk symbol with open center,
 * matching the exact pixel geometry from the reference mockup.
 */
interface ProjectStatusSymbolProps {
  size?: number;
  color?: string;
}

const ProjectStatusSymbol: React.FC<ProjectStatusSymbolProps> = ({
  size = 13,
  color = '#64748B',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="16.0" y1="12.0" x2="21.5" y2="12.0" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="14.83" y1="14.83" x2="18.72" y2="18.72" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="12.0" y1="16.0" x2="12.0" y2="21.5" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="9.17" y1="14.83" x2="5.28" y2="18.72" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="8.0" y1="12.0" x2="2.5" y2="12.0" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="9.17" y1="9.17" x2="5.28" y2="5.28" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="12.0" y1="8.0" x2="12.0" y2="2.5" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <Line x1="14.83" y1="9.17" x2="18.72" y2="5.28" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    </Svg>
  );
};

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
        {/* Track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
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

interface ProjectCardData {
  id: string;
  title: string;
  completedTasks: number;
  totalTasks: number;
}

const PINNED_PROJECTS: ProjectCardData[] = [
  {
    id: 'website-design',
    title: 'Website Design',
    completedTasks: 3,
    totalTasks: 5,
  },
  {
    id: 'ux-research',
    title: 'UX Research',
    completedTasks: 6,
    totalTasks: 10,
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    completedTasks: 4,
    totalTasks: 8,
  },
  {
    id: 'client-project',
    title: 'Client Project',
    completedTasks: 9,
    totalTasks: 12,
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

export const TaskManagerScreen: React.FC<TaskManagerScreenProps> = ({ onSelectProject }) => {
  const theme = useAppTheme();

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

  return (
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

      {/* 2. Calendar Horizontal Week Strip (Floating on canvas with circular arrows) */}
      <View style={styles.calendarStripRow}>
        {/* Left Arrow Circular Button */}
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

        {/* Right Arrow Circular Button */}
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

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.seeAllButton}
        >
          <Text style={[styles.seeAllText, { color: theme.textDim }]}>See All</Text>
          <ChevronRight size={14} color={theme.textDim} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* 2x2 Project Cards Grid */}
      <View style={styles.projectsGrid}>
        {PINNED_PROJECTS.map((project) => {
          return (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.85}
              onPress={() => onSelectProject?.(project.id)}
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
                  {project.completedTasks}/{project.totalTasks} completed
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
});
