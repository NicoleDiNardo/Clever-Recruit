/**
 * Translates an internal pipeline stage into the plain-language status a
 * candidate sees on the public status-lookup page — never the raw stage
 * keyword. See user-flows.md flow 9 and the IA doc's /status spec.
 */
export function getPublicStatusLabel(stage?: string): string {
  switch (stage?.toLowerCase()) {
    case 'applied':
      return 'Application received';
    case 'screening':
      return 'In review';
    case 'interview':
      return 'Interview stage';
    case 'assessment':
      return 'Assessment in progress';
    case 'offer':
      return 'Offer extended';
    case 'hired':
      return 'Hired — congratulations!';
    case 'rejected':
      return 'Not moving forward at this time';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return 'Application received';
  }
}

/** Mantine color to pair with the label above — mirrors, but doesn't reuse,
 *  the internal STAGE_COLORS map, since a candidate should never see that a
 *  status maps 1:1 to an internal stage key. */
export function getPublicStatusColor(stage?: string): string {
  switch (stage?.toLowerCase()) {
    case 'hired':
      return 'green';
    case 'rejected':
      return 'red';
    case 'withdrawn':
      return 'gray';
    case 'offer':
      return 'orange';
    case 'interview':
    case 'assessment':
      return 'teal';
    default:
      return 'blue';
  }
}
