<template>
  <div style="height: 400px; width: 1500px">
    <AgGridVue
      :columnDefs="columnDefs"
      :row-data="rowDataStocks"
      style="height: 100%; width: 100%"
      @grid-ready="onGridReady"
      :theme="myTheme"
    >
    </AgGridVue>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const myTheme = themeQuartz.withParams({
  accentColor: '#0081ff',
  fontSize: '25px',
})

const columnDefs = ref([
  { field: 'id', headerName: 'ID', valueGetter: (params) => params.data.ID },
  {
    field: 'referencia',
    headerName: 'Referencia',
    valueGetter: (params) => params.data.Data?.resource,
  },
  { field: 'accion', headerName: 'Accion', valueGetter: (params) => params.data.Data?.action },
])
const rowDataStocks = ref([])
const onGridReady = async () => {
  try {
    const response = await axios.get('https://api.fuenzalidafredes.cl/datos/stocks')
    rowDataStocks.value = response.data
  } catch (error) {
    console.error('Error obteniendo datos desde api.fuenzalidafredes.cl/datos Error:', error)
  }
}
</script>
