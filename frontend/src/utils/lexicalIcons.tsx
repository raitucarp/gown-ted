import React from "react";
import {
  GiCube,
  GiSwordClash,
  GiSparkles,
  GiWindyStripes,
  GiCompass,
  GiWolfHead,
  GiAnvil,
  GiBrain,
  GiTalk,
  GiConversation,
  GiCelebrationFire,
  GiHearts,
  GiHeartBeats,
  GiBread,
  GiMeal,
  GiTeamIdea,
  GiWorld,
  GiBullseye,
  GiCrystalCluster,
  GiPerson,
  GiTreeBranch,
  GiWillowTree,
  GiCoins,
  GiGears,
  GiScales,
  GiHourglass,
  GiDrop,
  GiPocketWatch,
  GiCycle,
  GiMegaphone,
  GiTrophy,
  GiPunch,
  GiWingfoot,
  GiEyeTarget,
  GiShakingHands,
  GiPartyPopper,
  GiSunCloud,
  GiCrown,
  GiHammerDrop,
} from "react-icons/gi";
import {
  LuBox,
  LuSparkles,
  LuTag,
  LuCompass,
  LuActivity,
  LuFolder,
  LuSmile,
  LuZap,
} from "react-icons/lu";

export interface LexicalVisual {
  icon: React.ReactElement;
  label: string;
  palette: "blue" | "purple" | "green" | "amber" | "teal" | "cyan" | "orange" | "pink" | "red" | "gray";
  description?: string;
}

/**
 * Visual styling and icons for Parts of Speech
 */
export function getPosVisual(pos?: string): LexicalVisual {
  const p = (pos || "").toLowerCase();
  switch (p) {
    case "n":
    case "noun":
      return {
        icon: <GiCube />,
        label: "Noun",
        palette: "blue",
        description: "Substantive entity, object, person, or concept",
      };
    case "v":
    case "verb":
      return {
        icon: <GiSwordClash />,
        label: "Verb",
        palette: "green",
        description: "Action, state, occurrence, or transition",
      };
    case "a":
    case "adj":
    case "adjective":
      return {
        icon: <GiSparkles />,
        label: "Adjective",
        palette: "purple",
        description: "Descriptor modifying an entity",
      };
    case "s":
    case "adjective satellite":
    case "satellite":
      return {
        icon: <LuSparkles />,
        label: "Adj Satellite",
        palette: "purple",
        description: "Satellite adjective linked to a central cluster",
      };
    case "r":
    case "adv":
    case "adverb":
      return {
        icon: <GiWindyStripes />,
        label: "Adverb",
        palette: "amber",
        description: "Modifier of action, condition, or degree",
      };
    default:
      return {
        icon: <LuTag />,
        label: pos || "Other",
        palette: "gray",
        description: "Lexical component",
      };
  }
}

/**
 * Comprehensive visual icon and theme mapping for all 45 WordNet Lexicographer Files (lexfile)
 */
export function getLexFileVisual(lexfile?: string): LexicalVisual {
  const lf = (lexfile || "").toLowerCase().trim();

  // Mapping WordNet Lexicographer Files
  switch (lf) {
    // Noun domains
    case "noun.tops":
      return { icon: <GiCrown />, label: "Tops / Unique Beginners", palette: "purple" };
    case "noun.act":
      return { icon: <GiPunch />, label: "Acts & Actions", palette: "red" };
    case "noun.animal":
      return { icon: <GiWolfHead />, label: "Fauna & Animals", palette: "teal" };
    case "noun.artifact":
      return { icon: <GiAnvil />, label: "Artifacts & Tools", palette: "orange" };
    case "noun.attribute":
      return { icon: <GiBullseye />, label: "Attributes & Traits", palette: "blue" };
    case "noun.body":
      return { icon: <GiHeartBeats />, label: "Anatomy & Body", palette: "pink" };
    case "noun.cognition":
      return { icon: <GiBrain />, label: "Cognition & Thought", palette: "purple" };
    case "noun.communication":
      return { icon: <GiTalk />, label: "Communication", palette: "cyan" };
    case "noun.event":
      return { icon: <GiCelebrationFire />, label: "Events & Happenings", palette: "amber" };
    case "noun.feeling":
      return { icon: <GiHearts />, label: "Feelings & Emotions", palette: "pink" };
    case "noun.food":
      return { icon: <GiBread />, label: "Food & Sustenance", palette: "orange" };
    case "noun.group":
      return { icon: <GiTeamIdea />, label: "Groups & Collectives", palette: "teal" };
    case "noun.location":
      return { icon: <GiWorld />, label: "Locations & Places", palette: "cyan" };
    case "noun.motive":
      return { icon: <GiEyeTarget />, label: "Motives & Reasons", palette: "purple" };
    case "noun.object":
      return { icon: <GiCube />, label: "Natural Objects", palette: "blue" };
    case "noun.person":
      return { icon: <GiPerson />, label: "People & Individuals", palette: "blue" };
    case "noun.phenomenon":
      return { icon: <GiSunCloud />, label: "Natural Phenomena", palette: "cyan" };
    case "noun.plant":
      return { icon: <GiWillowTree />, label: "Flora & Plants", palette: "green" };
    case "noun.possession":
      return { icon: <GiCoins />, label: "Possession & Wealth", palette: "amber" };
    case "noun.process":
      return { icon: <GiGears />, label: "Processes & Dynamics", palette: "orange" };
    case "noun.quantity":
      return { icon: <GiScales />, label: "Quantities & Measures", palette: "blue" };
    case "noun.relation":
      return { icon: <GiShakingHands />, label: "Relations & Links", palette: "purple" };
    case "noun.shape":
      return { icon: <GiCrystalCluster />, label: "Shapes & Geometries", palette: "teal" };
    case "noun.state":
      return { icon: <GiHourglass />, label: "States & Conditions", palette: "amber" };
    case "noun.substance":
      return { icon: <GiDrop />, label: "Substances & Materials", palette: "cyan" };
    case "noun.time":
      return { icon: <GiPocketWatch />, label: "Time & Periods", palette: "amber" };

    // Verb domains
    case "verb.body":
      return { icon: <GiHeartBeats />, label: "Bodily Care & Functions", palette: "pink" };
    case "verb.change":
      return { icon: <GiCycle />, label: "Transformation & Change", palette: "teal" };
    case "verb.cognition":
      return { icon: <GiBrain />, label: "Thinking & Judging", palette: "purple" };
    case "verb.communication":
      return { icon: <GiMegaphone />, label: "Telling & Asking", palette: "cyan" };
    case "verb.competition":
      return { icon: <GiTrophy />, label: "Fighting & Competing", palette: "red" };
    case "verb.consumption":
      return { icon: <GiMeal />, label: "Eating & Ingesting", palette: "orange" };
    case "verb.contact":
      return { icon: <GiHammerDrop />, label: "Touching & Fastening", palette: "blue" };
    case "verb.creation":
      return { icon: <GiAnvil />, label: "Sewing, Baking & Crafting", palette: "amber" };
    case "verb.emotion":
      return { icon: <GiHearts />, label: "Feeling & Emoting", palette: "pink" };
    case "verb.motion":
      return { icon: <GiWingfoot />, label: "Movement & Locomotion", palette: "green" };
    case "verb.perception":
      return { icon: <GiEyeTarget />, label: "Seeing, Hearing & Sensing", palette: "purple" };
    case "verb.possession":
      return { icon: <GiCoins />, label: "Giving & Transferring", palette: "amber" };
    case "verb.social":
      return { icon: <GiPartyPopper />, label: "Socializing & Political", palette: "teal" };
    case "verb.stative":
      return { icon: <GiHourglass />, label: "Being & Existing", palette: "blue" };
    case "verb.weather":
      return { icon: <GiSunCloud />, label: "Raining & Weathering", palette: "cyan" };

    // Adjectives & Adverbs
    case "adj.all":
      return { icon: <GiSparkles />, label: "Descriptive Qualities", palette: "purple" };
    case "adj.pert":
      return { icon: <GiCompass />, label: "Relational Adjectives", palette: "blue" };
    case "adv.all":
      return { icon: <GiWindyStripes />, label: "Adverbial Modifiers", palette: "amber" };

    default:
      if (lf.startsWith("noun.")) {
        return { icon: <GiCube />, label: lf.replace("noun.", "Noun: "), palette: "blue" };
      }
      if (lf.startsWith("verb.")) {
        return { icon: <GiSwordClash />, label: lf.replace("verb.", "Verb: "), palette: "green" };
      }
      if (lf.startsWith("adj.")) {
        return { icon: <GiSparkles />, label: lf.replace("adj.", "Adj: "), palette: "purple" };
      }
      if (lf.startsWith("adv.")) {
        return { icon: <GiWindyStripes />, label: lf.replace("adv.", "Adv: "), palette: "amber" };
      }
      return {
        icon: <LuFolder />,
        label: lf || "Domain",
        palette: "gray",
      };
  }
}
