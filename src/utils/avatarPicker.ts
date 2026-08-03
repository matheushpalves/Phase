import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

function getAvatarsDirectory(): Directory {
  const dir = new Directory(Paths.document, 'avatars');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * Opens the system photo picker and persists the chosen image into the app's
 * document directory (the picker's own URI is a temp/cache file that isn't
 * guaranteed to stick around), so it survives app restarts.
 *
 * @param slot distinguishes the user's own photo from the partner's, so re-picking one doesn't clobber the other.
 * @returns the persisted file URI, or null if the picker was cancelled or permission was denied.
 */
export async function pickAndPersistAvatar(slot: 'user' | 'partner', ownerId: number): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets[0]) return null;

  const sourceFile = new File(result.assets[0].uri);
  const destination = new File(getAvatarsDirectory(), `${slot}-${ownerId}${sourceFile.extension || '.jpg'}`);
  await sourceFile.copy(destination, { overwrite: true });

  return destination.uri;
}
