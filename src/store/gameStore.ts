import { ref } from 'vue';
import type { ResourceLink, Comment } from '@/api/api';

interface GameResources {
  [gameId: string]: ResourceLink[];
}

interface GameComments {
  [gameId: string]: Comment[];
}

const gameResources = ref<GameResources>({});
const gameComments = ref<GameComments>({});

export function useGameStore() {
  function setResources(gameId: string, resources: ResourceLink[]) {
    gameResources.value[gameId] = resources;
  }

  function getResources(gameId: string): ResourceLink[] {
    return gameResources.value[gameId] || [];
  }

  function setComments(gameId: string, comments: Comment[]) {
    gameComments.value[gameId] = comments;
  }

  function getComments(gameId: string): Comment[] {
    return gameComments.value[gameId] || [];
  }

  return {
    gameResources,
    gameComments,
    setResources,
    getResources,
    setComments,
    getComments
  };
}