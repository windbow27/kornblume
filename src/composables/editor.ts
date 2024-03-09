export function formatDate (timestamp: number): string {
    const date: Date = new Date(timestamp);
    const formattedDate: string = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime: string = date.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return `${formattedDate} ${formattedTime}`;
}

export function dateToTimestamp (date: Date): number {
    return date.getTime();
}
