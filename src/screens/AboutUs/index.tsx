import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import styles from './styles';

type AboutSection = {
  title: string;
  tagline?: string;
  body: string[];
  bullets?: Array<{label: string; text: string}>;
};

const SECTIONS: AboutSection[] = [
  {
    title: 'About ALSE',
    tagline: 'Connect. Discover. Belong.',
    body: [
      'ALSE is a global digital platform created to bring people, businesses, creators, and communities closer together through technology.',
      'We believe that technology should do more than connect people—it should create opportunities. ALSE was built to provide a place where people can communicate, discover new ideas, support businesses, showcase their products, and reach customers beyond their local communities.',
    ],
  },
  {
    title: 'Our Platform',
    body: [
      'ALSE brings together social networking, commerce, and logistics within one connected ecosystem.',
    ],
    bullets: [
      {
        label: 'Social Network',
        text: 'Connect with people around the world, share photos and videos, create posts and Stories, watch Reels, interact with communities, and participate in live experiences through ALSE Live.',
      },
      {
        label: 'Marketplace',
        text: 'Discover products, support businesses, create a store, showcase products, and connect with customers locally and internationally. ALSE is designed to give individuals, entrepreneurs, and small businesses the opportunity to participate in the digital economy.',
      },
      {
        label: 'Logistics',
        text: 'We are developing an integrated logistics experience that helps connect sellers, customers, riders, and shipping services, making it easier for products to move from sellers to customers.',
      },
    ],
  },
  {
    title: 'Our Mission',
    body: [
      'Our mission is to connect people and businesses through technology while creating opportunities for communication, commerce, entrepreneurship, and economic growth.',
      'We want to make digital opportunities more accessible to individuals and businesses, regardless of where they are located.',
    ],
  },
  {
    title: 'Our Vision',
    body: [
      'Our vision is to build a global digital ecosystem where people can connect with one another, businesses can reach new markets, creators can share their ideas, and communities can participate in the global economy.',
      'We envision a future where a product, idea, or business can begin in one community and reach people anywhere in the world.',
    ],
  },
  {
    title: 'Why ALSE?',
    body: [
      'The world is becoming increasingly connected, but millions of people and small businesses still face barriers when trying to reach customers, promote their ideas, and participate in the global digital economy.',
      'ALSE is being built to help bridge that gap.',
      'By bringing social connection, marketplace opportunities, and logistics together, ALSE aims to create a simpler and more connected experience for users and businesses.',
    ],
  },
  {
    title: 'Building for the Future',
    body: [
      'ALSE is more than an application. It is a growing ecosystem designed around people, businesses, creators, and communities.',
      'As we continue to develop the platform, our goal is to introduce new tools and opportunities that help users connect, discover, create, and grow.',
      'We believe that everyone has an idea, a story, a product, or an opportunity worth sharing.',
      'ALSE is here to help those ideas travel across the world.',
    ],
  },
];

const AboutUs: React.FC = () => {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.brand}>ALSE</Text>
        <Text style={styles.heroTagline}>Connect. Discover. Belong.</Text>
        <Text style={styles.heroLine}>
          Let your ideas travel across the world.
        </Text>
      </View>

      {SECTIONS.map(section => (
        <View key={section.title} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {!!section.tagline && (
            <Text style={styles.sectionTagline}>{section.tagline}</Text>
          )}
          {section.body.map(paragraph => (
            <Text key={paragraph.slice(0, 40)} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map(item => (
            <View key={item.label} style={styles.bulletBlock}>
              <Text style={styles.bulletLabel}>{item.label}</Text>
              <Text style={styles.paragraph}>{item.text}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>ALSE</Text>
        <Text style={styles.footerTagline}>Connect. Discover. Belong.</Text>
        <Text style={styles.footerLine}>
          Let your ideas travel across the world.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AboutUs;
