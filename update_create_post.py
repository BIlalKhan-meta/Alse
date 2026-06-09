import re

with open('src/screens/CreatePost/index.tsx', 'r') as f:
    content = f.read()

# Add imagesData to useImagePicker
content = content.replace("const {imageData, chooseImageFromLibrary} = useImagePicker();", "const {imageData, imagesData, chooseImageFromLibrary, setImagesData} = useImagePicker();")

# Add state for multiple media
state_addition = """  const [selectedMediaList, setSelectedMediaList] = useState<SelectedMedia[]>([]);"""
content = content.replace("const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);", "const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);\n" + state_addition)

# Update useEffect for imagesData
effect_addition = """
  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      const newMediaList: SelectedMedia[] = imagesData.map(asset => {
        const assetType = asset.type ?? '';
        const kind: MediaKind = assetType.startsWith('video') || asset.duration != null ? 'video' : 'image';
        return {
          uri: asset.uri,
          name: asset.fileName,
          type: asset.type,
          kind,
        };
      });
      setSelectedMediaList(newMediaList);
    }
  }, [imagesData]);
"""
content = content.replace("  useEffect(() => {\n    if (!imageData?.uri) {", effect_addition + "\n  useEffect(() => {\n    if (!imageData?.uri) {")

# Update handlePost to handle multiple media
old_append = """    if (selectedMedia?.uri) {
      appendMediaToForm(body, selectedMedia);
    }"""
new_append = """    if (selectedMediaList.length > 0) {
      selectedMediaList.forEach((media, index) => {
        if (media.kind === 'video') {
          const file = createVideoFile(media.uri);
          body.append(`file[${index}]`, file as any);
        } else {
          body.append(`file[${index}]`, {
            uri: media.uri,
            name: media.name || `image_${index}.jpg`,
            type: media.type || 'image/jpeg',
          } as any);
        }
      });
    } else if (selectedMedia?.uri) {
      appendMediaToForm(body, selectedMedia);
    }"""
content = content.replace(old_append, new_append)

# Update disabled condition
content = content.replace("(!description.trim() && !selectedMedia)", "(!description.trim() && !selectedMedia && selectedMediaList.length === 0)")

# Add remove media function
remove_fn = """  const removeMedia = (indexToRemove: number) => {
    const newList = selectedMediaList.filter((_, index) => index !== indexToRemove);
    setSelectedMediaList(newList);
    if (newList.length === 0) {
      setSelectedMedia(null);
      setImagesData([]);
    }
  };"""
content = content.replace("  const renderPrivacyOption", remove_fn + "\n\n  const renderPrivacyOption")

# Update media preview section
old_preview = """        {/* Selected Media Preview */}
        {selectedMedia && (
          <View style={styles.selectedMediaContainer}>
            {selectedMedia.kind === 'video' ? (
              <Video
                source={{uri: selectedMedia.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
                repeat
                muted
              />
            ) : (
              <Image
                source={{uri: selectedMedia.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => setSelectedMedia(null)}>
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        )}"""

new_preview = """        {/* Selected Media Preview */}
        {selectedMediaList.length > 0 ? (
          <View style={styles.multiMediaContainer}>
            {/* Main Image */}
            <View style={styles.mainMediaWrapper}>
              {selectedMediaList[0].kind === 'video' ? (
                <Video
                  source={{uri: selectedMediaList[0].uri}}
                  style={styles.mainMediaImage}
                  resizeMode="cover"
                  repeat
                  muted
                />
              ) : (
                <Image
                  source={{uri: selectedMediaList[0].uri}}
                  style={styles.mainMediaImage}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(0)}>
                <X color="#fff" size={14} />
              </TouchableOpacity>
            </View>

            {/* Thumbnail Images */}
            {selectedMediaList.length > 1 && (
              <View style={styles.thumbnailRow}>
                {selectedMediaList.slice(1, 4).map((media, index) => (
                  <View key={index} style={styles.thumbnailWrapper}>
                    {media.kind === 'video' ? (
                      <Video
                        source={{uri: media.uri}}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                        repeat
                        muted
                      />
                    ) : (
                      <Image
                        source={{uri: media.uri}}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeThumbnailButton}
                      onPress={() => removeMedia(index + 1)}>
                      <X color="#fff" size={10} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : selectedMedia && (
          <View style={styles.selectedMediaContainer}>
            {selectedMedia.kind === 'video' ? (
              <Video
                source={{uri: selectedMedia.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
                repeat
                muted
              />
            ) : (
              <Image
                source={{uri: selectedMedia.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => {
                setSelectedMedia(null);
                setSelectedMediaList([]);
                setImagesData([]);
              }}>
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        )}"""
content = content.replace(old_preview, new_preview)

# Add music dummy text
music_text = """            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 5}}>
              <Text style={{fontSize: 13, color: '#333'}}>ABC Music</Text>
              <TouchableOpacity style={{marginLeft: 5}}>
                <View style={{width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center'}}>
                  <X color="#333" size={10} />
                </View>
              </TouchableOpacity>
            </View>"""
content = content.replace("""            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>""", music_text)

# Update chooseImageFromLibrary to pass selectionLimit
content = content.replace("chooseImageFromLibrary('photo')", "chooseImageFromLibrary('photo', 4)")

with open('src/screens/CreatePost/index.tsx', 'w') as f:
    f.write(content)

print("Replaced successfully")
