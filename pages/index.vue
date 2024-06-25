<template>
  <div class="flex h-screen items-center">
    <div class="flex flex-col w-screen items-center">
      <div class="flex flex-row gap-2">
        <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
          New Game
        </button>
        <NuxtLink to="/practise">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Practise
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
