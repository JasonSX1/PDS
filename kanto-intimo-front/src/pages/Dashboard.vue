<script lang="ts" setup>
import MenuCard from '../components/MenuCard.vue'
</script>

<template>
  <div class="min-h-screen bg-white-50 px-6 py-8" >

    <header class="w-full flex items-center justify-between py-4 pb-15">
      <!-- Agrupamento do logo e texto à esquerda -->
      <div class="flex items-center">
        <img 
          src="@/assets/logo.png" 
          alt="Logo Kanto" 
          class="h-16 mr-3"
        />
        <div class="text-xl font-bold text-gray-900">
          <div>ERP</div>
          <div>Kanto</div>
          <div>Íntimo</div>
        </div>
      </div>

      <!-- Barra de pesquisa centralizada -->
      <div class="flex-grow flex justify-center">
        <input
          type="text"
          placeholder="Pesquisa"
          class="border px-4 py-2 rounded-md w-64 text-sm"
        />
      </div>
      
      <!-- Espaço vazio à direita para manter o equilíbrio -->
      <div class="w-32"></div>
    </header>


    <!-- Navegação -->
    <nav class="flex justify-center space-x-6 mb-10 pb-2 text-sm text-gray-600 flex gap-6 align-center">
      <span class="font-semibold text-pink-600">Tela Inicial</span>
      <span class="cursor-pointer">Vendas</span>
      <span class="cursor-pointer">Vendedores</span>
      <span class="cursor-pointer">Produtos</span>
      <span class="cursor-pointer">Estoque</span>
      <span class="cursor-pointer">Fornecedores</span>
      <span class="cursor-pointer">Pedidos</span>
      <span class="cursor-pointer">Clientes</span>
      <span class="cursor-pointer">Despesas</span>
    </nav>

    <!-- Blocos de acesso -->
    <main class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-x-50 w-full"style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">      <MenuCard icon="💸" label="VENDAS" />
      
      <MenuCard icon="👥" label="VENDEDORES" />
      <MenuCard icon="📦" label="PRODUTOS" />
      <MenuCard icon="📊" label="ESTOQUE" />
      <MenuCard icon="🚚" label="FORNECEDORES" />
      <MenuCard icon="🧾" label="PEDIDOS" />
      <MenuCard icon="🧍" label="CLIENTES" />
      <MenuCard icon="💰" label="DESPESAS" />
    </main>
  </div>
</template>

