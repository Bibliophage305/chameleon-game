<template>
  <div class="flex h-screen items-center">
    <div class="flex flex-col w-screen items-center">
      <div class="flex flex-row gap-2">
        <NuxtLink to="/newgame">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Online PvP
          </button>
        </NuxtLink>
        <NuxtLink to="/localpvp">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Local PvP
          </button>
        </NuxtLink>
        <NuxtLink to="/computer">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Play against computer
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
