export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface User {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

export interface Task {
    id: string
    userId: string
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    dueDate: string | null
    createdAt: string
    updatedAt: string
}

export interface DashboardStatistics {
    total: number
    todo: number
    inProgress: number
    done: number
    completionPercentage: number
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface DataResponse<T> {
    data: T
}

export type AuthResponse = DataResponse<{
    user: User
}>

export type TaskResponse = DataResponse<{
    task: Task
}>

export interface TaskListResponse {
    data: {
        tasks: Task[]
    }
    meta: PaginationMeta
}

export type DashboardResponse = DataResponse<{
    statistics: DashboardStatistics
    recentTasks: Task[]
}>
