<template>
  <div id="app">
    <div class="container">
      <h1 class="text text--40 text--white text--center">
        Crush Pics Vue Input example
      </h1>
      <file-input></file-input>
    </div>
  </div>
</template>

<script>
import FileInput from './components/FileInput.vue'

export default {
  name: 'app',
  components: {
    'file-input': FileInput
  }
}
</script>

<style scoped lang="sass">
$lato: 'Lato', sans-serif

body
	font-size: 16px
	min-width: 320px
	position: relative
	line-height: 1.6
	font-family: $lato
	overflow-x: hidden
.text
  &--40
    font-size: 40px
  &--black
    color: black
  &--center
    text-align: center
.container
  display: block
  margin-left: auto
  margin-right: auto
  width: 800px
  position: relative
</style>
