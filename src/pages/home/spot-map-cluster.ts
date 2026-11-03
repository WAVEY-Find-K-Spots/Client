export interface ClusterPoint<T> {
  item: T;
  x: number;
  y: number;
}

export interface SpotCluster<T> {
  items: T[];
  /** 묶음에 속한 점들의 평균 좌표(화면 픽셀 기준) */
  x: number;
  y: number;
}

/**
 * 화면 픽셀을 일정 크기의 칸으로 나눠, 같은 칸에 들어온 핀을 하나로 묶는다.
 * 지도를 확대하면 픽셀 간격이 벌어져 자연스럽게 풀린다.
 */
export function clusterByCell<T>(
  points: ClusterPoint<T>[],
  cellSize: number,
): SpotCluster<T>[] {
  const cells = new Map<string, ClusterPoint<T>[]>();
  for (const point of points) {
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    const cell = cells.get(key);
    if (cell) cell.push(point);
    else cells.set(key, [point]);
  }

  return Array.from(cells.values(), (cell) => ({
    items: cell.map((point) => point.item),
    x: cell.reduce((sum, point) => sum + point.x, 0) / cell.length,
    y: cell.reduce((sum, point) => sum + point.y, 0) / cell.length,
  }));
}
