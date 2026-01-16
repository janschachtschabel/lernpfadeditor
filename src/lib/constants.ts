import type { Template } from './types'

export const defaultTemplate: Template = {
  metadata: {
    title: 'Example Template',
    description: 'A basic template example',
    version: '1.0'
  },
  problem: {
    description: 'Basic problem description',
    goals: ['Goal 1', 'Goal 2']
  },
  solution: {
    description: 'Basic solution description',
    steps: ['Step 1', 'Step 2']
  }
}