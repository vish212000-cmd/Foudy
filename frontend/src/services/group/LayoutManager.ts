export class LayoutManager {
    /**
     * Determines optimal grid layout based on participant count.
     * Max 6 participants.
     */
    public static getGridLayout(count: number): string {
        switch (count) {
            case 1:
                return 'grid-cols-1 grid-rows-1';
            case 2:
                return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
            case 3:
            case 4:
                return 'grid-cols-2 grid-rows-2';
            case 5:
            case 6:
                return 'grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2';
            default:
                return 'grid-cols-1';
        }
    }
}
