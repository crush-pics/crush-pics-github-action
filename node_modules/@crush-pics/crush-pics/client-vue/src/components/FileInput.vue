<template>
  <div>
    <form
      class="form"
      ref="formInput"
      action="upload_file"
      role="form"
      method="post"
      enctype="multipart/form-data"
    >
      <input
        type="file"
        ref="fileInput"
        name="fileInput"
        style="display: none"
        accept="file"
        multiple
        @change="onFilePicked"
      />
      <div class="img-wrap" v-if="imgSrc">
        <img class="img" :src="imgSrc" alt="" />
      </div>
      <button class="btn" @click.prevent="onPickFile">add image</button>
    </form>
    <h2 class="text text--20 text--center text--black">Get All report</h2>
    <button class="btn" @click="getAllReport">get all report</button>
  </div>
</template>

<script>
// import axios from 'axios'
import crushPics from 'crush-pics'
export default {
  name: 'FileInput',
  data() {
    return {
      token: '',
      url: 'https://api.crush.pics/v1',
      imgSrc: null
    }
  },
  methods: {
    init() {
      crushPics.configure({
        api_token: this.token,
        baseUrl: this.url
      })
    },
    onPickFile() {
      this.$refs.fileInput.click()
    },
    onFilePicked(event) {
      const file = event.target.files[0]

      // .original_images.create
      crushPics.original_images
        .create({ file: file })
        .then(res => {
          console.log('app test formData(blob) res:', res, '\n')
          this.imgSrc = res.data.original_image.link
          return this.imgSrc
        })
        .catch(err =>
          console.log('app test formData(blob) file err:', err.message)
        )

      // original_images.compress (img file)
      crushPics.original_images
        .compress({
          file: file,
          compression_level: 75,
          compression_type: 'lossless'
        })
        .then(res => console.log('app compress file res:', res, '\n'))
        .catch(err => console.log('app compress file err:', err))
    },

    getAllReport() {
      const type = 'week'
      // dashboard.get
      crushPics.dashboard
        .get({ report_type: type })
        .then(res => console.log('app get res:', res, '\n'))
        .catch(err => console.log('app get err:', err))

      // invoices.list
      crushPics.invoices
        .list()
        .then(res => console.log('app list res:', res, '\n'))
        .catch(err => console.log('app list err:', err))

      // original_images.create (img link)
      crushPics.original_images
        .create({
          image_url:
            'https://m.media-amazon.com/images/M/MV5BMTg2MTMyMzU0M15BMl5BanBnXkFtZTgwOTU3ODk4NTE@._V1_SY1000_CR0,0,674,1000_AL_.jpg'
        })
        .then(res => console.log('app compress file res:', res, '\n'))
        .catch(err => console.log('app compress file err:', err))

      // original_images.compress img link
      crushPics.original_images
        .compress({
          image_url:
            'https://m.media-amazon.com/images/M/MV5BMTg2MTMyMzU0M15BMl5BanBnXkFtZTgwOTU3ODk4NTE@._V1_SY1000_CR0,0,674,1000_AL_.jpg',
          compression_type: 'lossy',
          compression_level: 65
        })
        .then(res =>
          console.log('app original_images.compress res:', res, '\n')
        )
        .catch(err => console.log('app original_images.compress err:', err))

      // original_images.get:id
      crushPics.original_images
        .get(6237)
        .then(res => console.log('app original_images.list res:', res, '\n'))
        .catch(err => console.log('app original_images.list err:', err))

      // original_images.list
      crushPics.original_images
        .list()
        .then(res => console.log('app original_images.list res:', res, '\n'))
        .catch(err => console.log('app original_images.list err:', err))

      // callback_urls.list
      crushPics.original_images
        .list()
        .then(res => console.log('app callback_urls.list res:', res, '\n'))
        .catch(err => console.log('app callback_urls.list err:', err))

      // account.get
      crushPics.account
        .get()
        .then(res => console.log('app account get res:', res, '\n'))
        .catch(err => console.log('app account get err:', err))

      // account.update
      crushPics.account
        .update({ compression_level_jpg: 70 })
        .then(res => console.log('app account update res:', res, '\n'))
        .catch(err => console.log('app account update err:', err))

      // exports.get
      crushPics.export
        .get()
        .then(res => console.log('app export.get res:', res, '\n'))
        .catch(err => console.log('app export.get err:', err))
    }
  },

  mounted() {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
$lato: 'Lato', sans-serif

.text
  &--20
    font-size: 20px
  &--black
    color: black
  &--center
    text-align: center
.form
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  border: 2px dashed #dfe3e8
  border-radius: 4px
  min-height: 150px
  padding: 20px 10px
  margin-bottom: 50px
.btn
  padding: 7px 16px
  font-size: 16px
  background-color: rgb(249, 250, 251)
  background-image: linear-gradient(rgb(255, 255, 255) 0%, rgb(249, 250, 251) 100%)
  border-bottom-color: rgb(196, 205, 213)
  border-radius: 3px
  border: 1px solid rgb(196, 205, 213)
  box-sizing:border-box
  color: rgb(33, 43, 54)
  font-size: 14px
  font-weight: 400
  text-align: center
  cursor: pointer
  margin: 0 auto
  display: block
  transition: box-shadow 0.15s ease-in-out
  &:hover, &:active, &:focus
    box-shadow: 1px 2px 2px 0px rgba(0, 0, 0, 0.5)
.img-wrap
  display: flex
  justify-content: center
  align-items: center
  width: 300px
  height: 200px
  margin-bottom: 20px
.img
  object-fit: cover
  width: 100%
  height: 100%
</style>
