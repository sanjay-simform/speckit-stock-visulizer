<script lang="ts">
  import { wsConnection } from '../stores.js';

  let status = 'DISCONNECTED';
  let statusText = 'Disconnected';
  let statusColor = 'text-red-400';

  wsConnection.subscribe(conn => {
    status = conn.status;
    
    switch (status) {
      case 'CONNECTED':
        statusText = 'Connected';
        statusColor = 'text-green-400';
        break;
      case 'DISCONNECTED':
        statusText = 'Disconnected';
        statusColor = 'text-red-400';
        break;
      case 'RECONNECTING':
        statusText = 'Reconnecting...';
        statusColor = 'text-yellow-400';
        break;
    }
  });
</script>

<div class="flex items-center gap-2">
  <div class="w-2 h-2 rounded-full {statusColor === 'text-green-400' ? 'bg-green-400' : statusColor === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-red-400'}"></div>
  <span class="{statusColor} text-sm">{statusText}</span>
</div>
