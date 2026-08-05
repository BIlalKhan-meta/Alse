import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';
import {createCampaign, CampaignPayload} from '../../api/advertising';
import {Toast, getMessage} from '../../utils/helpers';

const CAMPAIGN_TYPES: NonNullable<CampaignPayload['campaign_type']>[] = [
  'store',
  'product',
  'discount',
  'event',
  'seasonal',
  'sponsored_post',
];

const DESTINATION_TYPES: NonNullable<CampaignPayload['destination_type']>[] = [
  'product',
  'shop',
  'post',
  'url',
];

const CreateCampaign: React.FC = () => {
  const navigation = useNavigation<any>();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [campaignType, setCampaignType] =
    useState<CampaignPayload['campaign_type']>('store');
  const [budget, setBudget] = useState('');
  const [destinationType, setDestinationType] =
    useState<CampaignPayload['destination_type']>('shop');
  const [destinationId, setDestinationId] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [ctaText, setCtaText] = useState('Shop now');

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.error('Title is required');
      return;
    }
    const budgetNum = Number(budget);
    if (!budgetNum || budgetNum <= 0) {
      Toast.error('Budget must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload: CampaignPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        media_type: 'image',
        media_url: mediaUrl.trim() || undefined,
        campaign_type: campaignType,
        budget: budgetNum,
        destination_type: destinationType,
        destination_id:
          destinationType !== 'url' && destinationId
            ? Number(destinationId)
            : undefined,
        destination_url:
          destinationType === 'url' ? destinationUrl.trim() : undefined,
        cta_text: ctaText.trim() || 'Learn more',
      };
      await createCampaign(payload);
      Toast.success('Campaign created as draft');
      navigation.goBack();
    } catch (err: any) {
      Toast.error(getMessage(err?.response?.data ?? err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader icon title="Create Campaign" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Campaign title"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Short description"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        <Text style={styles.label}>Media URL</Text>
        <TextInput
          style={styles.input}
          value={mediaUrl}
          onChangeText={setMediaUrl}
          placeholder="https://..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Campaign type</Text>
        <View style={styles.chips}>
          {CAMPAIGN_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, campaignType === type && styles.chipActive]}
              onPress={() => setCampaignType(type)}>
              <Text
                style={[
                  styles.chipText,
                  campaignType === type && styles.chipTextActive,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Budget</Text>
        <TextInput
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
          placeholder="100"
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Destination type</Text>
        <View style={styles.chips}>
          {DESTINATION_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                destinationType === type && styles.chipActive,
              ]}
              onPress={() => setDestinationType(type)}>
              <Text
                style={[
                  styles.chipText,
                  destinationType === type && styles.chipTextActive,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {destinationType === 'url' ? (
          <>
            <Text style={styles.label}>Destination URL</Text>
            <TextInput
              style={styles.input}
              value={destinationUrl}
              onChangeText={setDestinationUrl}
              placeholder="https://..."
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Destination ID</Text>
            <TextInput
              style={styles.input}
              value={destinationId}
              onChangeText={setDestinationId}
              placeholder="Product / shop / post id"
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </>
        )}

        <Text style={styles.label}>CTA text</Text>
        <TextInput
          style={styles.input}
          value={ctaText}
          onChangeText={setCtaText}
          placeholder="Shop now"
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create draft</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 16, paddingBottom: 40},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.black,
    fontSize: 14,
  },
  multiline: {minHeight: 80, textAlignVertical: 'top'},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  chipText: {fontSize: 12, color: '#4B5563'},
  chipTextActive: {color: '#fff', fontWeight: '600'},
  submit: {
    marginTop: 24,
    backgroundColor: colors.themeColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {color: '#fff', fontWeight: '700', fontSize: 15},
});

export default CreateCampaign;
