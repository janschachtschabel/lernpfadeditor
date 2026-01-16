import React from 'react';
import { Node, Edge, MarkerType } from 'reactflow';

// Layout constants - generous spacing for clear visualization
const NODE_WIDTH = 350;
const SEQUENCE_HEIGHT = 90;
const PHASE_HEIGHT = 80;
const ACTIVITY_HEIGHT = 110;
const ROLE_WIDTH = 220;
const ROLE_HEIGHT = 90;

const V_GAP = 80;           // Vertical gap between elements
const H_GAP = 40;           // Horizontal gap between roles

const START_X = 100;
const START_Y = 60;

// Colors
const COLORS = {
  sequence: { bg: '#3b82f6', border: '#1d4ed8' },
  phase: { bg: '#dcfce7', border: '#22c55e' },
  activity: { bg: '#fef9c3', border: '#eab308' },
  role: { bg: '#ffedd5', border: '#f97316' },
  arrow: '#475569',
  parallel: '#8b5cf6'
};

function createLabel(title: string, subtitle?: string, details?: string[]) {
  const elements = [];
  
  elements.push(
    React.createElement('div', { 
      key: 'title',
      className: 'font-bold text-sm leading-tight'
    }, title)
  );
  
  if (subtitle) {
    elements.push(
      React.createElement('div', { 
        key: 'subtitle',
        className: 'text-xs opacity-80 mt-1'
      }, subtitle)
    );
  }
  
  if (details && details.length > 0) {
    elements.push(
      React.createElement('div', { 
        key: 'details',
        className: 'text-xs mt-2 space-y-1'
      }, details.map((d, i) => 
        React.createElement('div', { key: i, className: 'leading-tight' }, d)
      ))
    );
  }
  
  return React.createElement('div', { 
    className: 'p-3 text-center w-full h-full flex flex-col justify-center'
  }, elements);
}

export function createNodes(state: any) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const sequences = state.solution?.didactic_template?.learning_sequences || [];
  if (sequences.length === 0) return { nodes, edges };

  let currentY = START_Y;
  let prevSequenceId: string | null = null;
  let lastRoleIds: string[] = [];

  sequences.forEach((sequence: any, seqIndex: number) => {
    const sequenceId = sequence.sequence_id;
    const phases = sequence.phases || [];
    const isParallelSeq = sequence.transition_type === 'parallel';
    
    // Sequence node (no container, just a header)
    nodes.push({
      id: sequenceId,
      data: {
        label: createLabel(
          sequence.sequence_name || `Lernsequenz ${seqIndex + 1}`,
          sequence.time_frame,
          sequence.learning_goal ? [sequence.learning_goal] : undefined
        )
      },
      position: { x: START_X, y: currentY },
      style: {
        width: NODE_WIDTH,
        height: SEQUENCE_HEIGHT,
        backgroundColor: COLORS.sequence.bg,
        color: 'white',
        border: `3px solid ${COLORS.sequence.border}`,
        borderRadius: '12px',
        fontSize: '13px'
      }
    });

    // Connect from previous sequence or roles
    if (prevSequenceId) {
      if (lastRoleIds.length > 0) {
        // Connect from last roles to this sequence
        lastRoleIds.forEach((roleId) => {
          edges.push({
            id: `role-to-seq-${roleId}-${sequenceId}`,
            source: roleId,
            target: sequenceId,
            type: 'smoothstep',
            animated: isParallelSeq,
            style: { 
              stroke: isParallelSeq ? COLORS.parallel : COLORS.arrow, 
              strokeWidth: 2 
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: isParallelSeq ? COLORS.parallel : COLORS.arrow }
          });
        });
      } else {
        edges.push({
          id: `seq-flow-${prevSequenceId}-${sequenceId}`,
          source: prevSequenceId,
          target: sequenceId,
          type: 'smoothstep',
          animated: isParallelSeq,
          style: { 
            stroke: isParallelSeq ? COLORS.parallel : COLORS.arrow, 
            strokeWidth: 3 
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isParallelSeq ? COLORS.parallel : COLORS.arrow }
        });
      }
    }

    currentY += SEQUENCE_HEIGHT + V_GAP;
    let prevElementId = sequenceId;
    lastRoleIds = [];

    phases.forEach((phase: any, phaseIndex: number) => {
      const phaseId = phase.phase_id;
      const isParallelPhase = phase.transition_type === 'parallel';
      
      // Phase node
      nodes.push({
        id: phaseId,
        data: {
          label: createLabel(
            phase.phase_name || `Phase ${phaseIndex + 1}`,
            phase.time_frame
          )
        },
        position: { x: START_X, y: currentY },
        style: {
          width: NODE_WIDTH,
          height: PHASE_HEIGHT,
          backgroundColor: COLORS.phase.bg,
          border: `3px solid ${COLORS.phase.border}`,
          borderRadius: '10px',
          fontSize: '12px'
        }
      });

      // Connect from previous element (sequence or last roles)
      if (lastRoleIds.length > 0) {
        lastRoleIds.forEach(roleId => {
          edges.push({
            id: `role-to-phase-${roleId}-${phaseId}`,
            source: roleId,
            target: phaseId,
            type: 'smoothstep',
            style: { stroke: COLORS.arrow, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.arrow }
          });
        });
        lastRoleIds = [];
      } else {
        edges.push({
          id: `flow-${prevElementId}-${phaseId}`,
          source: prevElementId,
          target: phaseId,
          type: 'smoothstep',
          animated: isParallelPhase,
          style: { 
            stroke: isParallelPhase ? COLORS.parallel : COLORS.arrow, 
            strokeWidth: 2 
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isParallelPhase ? COLORS.parallel : COLORS.arrow }
        });
      }

      currentY += PHASE_HEIGHT + V_GAP;
      prevElementId = phaseId;

      const activities = phase.activities || [];
      activities.forEach((activity: any, actIndex: number) => {
        const activityId = activity.activity_id;
        const isParallelAct = activity.transition_type === 'parallel';
        
        // Activity node
        nodes.push({
          id: activityId,
          data: {
            label: createLabel(
              activity.name || `Aktivität ${actIndex + 1}`,
              `${activity.duration || 0} Minuten`,
              activity.description ? [activity.description.substring(0, 80)] : undefined
            )
          },
          position: { x: START_X, y: currentY },
          style: {
            width: NODE_WIDTH,
            height: ACTIVITY_HEIGHT,
            backgroundColor: COLORS.activity.bg,
            border: `3px solid ${COLORS.activity.border}`,
            borderRadius: '10px',
            fontSize: '11px'
          }
        });

        // Connect from previous element
        if (lastRoleIds.length > 0) {
          lastRoleIds.forEach(roleId => {
            edges.push({
              id: `role-to-act-${roleId}-${activityId}`,
              source: roleId,
              target: activityId,
              type: 'smoothstep',
              style: { stroke: COLORS.arrow, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.arrow }
            });
          });
          lastRoleIds = [];
        } else {
          edges.push({
            id: `flow-${prevElementId}-${activityId}`,
            source: prevElementId,
            target: activityId,
            type: 'smoothstep',
            animated: isParallelAct,
            style: { 
              stroke: isParallelAct ? COLORS.parallel : COLORS.arrow, 
              strokeWidth: 2 
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: isParallelAct ? COLORS.parallel : COLORS.arrow }
          });
        }

        currentY += ACTIVITY_HEIGHT + V_GAP;
        prevElementId = activityId;

        // Roles - arranged horizontally
        const roles = activity.roles || [];
        if (roles.length > 0) {
          const totalRolesWidth = roles.length * ROLE_WIDTH + (roles.length - 1) * H_GAP;
          const startRoleX = START_X + (NODE_WIDTH - totalRolesWidth) / 2;
          
          roles.forEach((role: any, roleIndex: number) => {
            const roleId = role.role_id;
            const actor = state.actors?.find((a: any) => a.id === role.actor_id);
            const roleX = startRoleX + roleIndex * (ROLE_WIDTH + H_GAP);

            nodes.push({
              id: roleId,
              data: {
                label: createLabel(
                  actor?.name || 'Akteur',
                  role.role_name,
                  role.task_description ? [role.task_description.substring(0, 50)] : undefined
                )
              },
              position: { x: roleX, y: currentY },
              style: {
                width: ROLE_WIDTH,
                height: ROLE_HEIGHT,
                backgroundColor: COLORS.role.bg,
                border: `3px solid ${COLORS.role.border}`,
                borderRadius: '8px',
                fontSize: '10px'
              }
            });

            // Connect activity to all roles (parallel arrows)
            edges.push({
              id: `act-to-role-${activityId}-${roleId}`,
              source: activityId,
              target: roleId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: COLORS.parallel, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.parallel }
            });

            lastRoleIds.push(roleId);
          });

          currentY += ROLE_HEIGHT + V_GAP;
        }
      });
    });

    prevSequenceId = sequenceId;
  });

  return { nodes, edges };
}