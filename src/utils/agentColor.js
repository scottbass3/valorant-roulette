const ROLE_COLORS = {
  Duelist:    { bg: '#3d0a0a', border: '#ff4655', text: '#ff8a94' },
  Controller: { bg: '#0a1a3d', border: '#4a90d9', text: '#7ab8f5' },
  Initiator:  { bg: '#0a2d0a', border: '#4caf50', text: '#81c784' },
  Sentinel:   { bg: '#2d0a3d', border: '#9c27b0', text: '#ce93d8' },
};

export function getAgentColorByRole(role) {
  return ROLE_COLORS[role] || { bg: '#1a1a1a', border: '#666', text: '#aaa' };
}
