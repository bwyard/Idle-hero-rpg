/**
 * serviceGates — Utility to check if the guild can fulfil a visitor's service request.
 *
 * Looks up BUILDING_TEMPLATES to find which building enables the service,
 * then checks if any building of that template exists at the required level.
 *
 * Pure function — no mutations, no side effects.
 */

import type { Building, VisitorServiceRequest } from '@idle-hero-rpg/shared';
import { BUILDING_TEMPLATES } from '../data/buildingTemplates';

/**
 * Check if the guild can fulfil a visitor's service request.
 *
 * @param service - The service the visitor is requesting
 * @param buildings - All buildings the guild owns (from GameState.buildings)
 * @returns true if any building enables the service at the required level
 */
export function canFulfillService(
  service: VisitorServiceRequest,
  buildings: Record<string, Building>,
): boolean {
  // Find which building template(s) enable this service
  const enablingTemplates = Object.values(BUILDING_TEMPLATES).filter(
    (template) => template.enablesService === service,
  );

  if (enablingTemplates.length === 0) return false;

  // Check if any owned building matches an enabling template at the required level
  return Object.values(buildings).some((building) => {
    const template = enablingTemplates.find((t) => t.id === building.templateId);
    if (!template) return false;
    return building.level >= template.serviceMinLevel;
  });
}
