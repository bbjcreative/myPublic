import firestore from '@react-native-firebase/firestore';

export interface CloudSavedRoute {
  id: string;
  label: string;
  origin_stop_id: string;
  dest_stop_id: string;
  origin_name: string;
  dest_name: string;
  savedAt: number;
}

const col = (uid: string) =>
  firestore().collection('users').doc(uid).collection('savedRoutes');

export function subscribeToSavedRoutes(
  uid: string,
  onUpdate: (routes: CloudSavedRoute[]) => void,
) {
  return col(uid)
    .orderBy('savedAt', 'desc')
    .limit(20)
    .onSnapshot(
      snap => onUpdate(snap.docs.map(d => d.data() as CloudSavedRoute)),
      () => {},
    );
}

export async function addRouteToCloud(uid: string, route: CloudSavedRoute): Promise<void> {
  await col(uid).doc(route.id).set(route);
}

export async function removeRouteFromCloud(uid: string, routeId: string): Promise<void> {
  await col(uid).doc(routeId).delete();
}

export async function bulkUploadRoutes(uid: string, routes: CloudSavedRoute[]): Promise<void> {
  if (!routes.length) return;
  const batch = firestore().batch();
  routes.forEach(r => batch.set(col(uid).doc(r.id), r));
  await batch.commit();
}
