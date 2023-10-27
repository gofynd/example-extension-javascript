<template>
    <div class="loader">
        <img src="./../assets/gifs/loader.gif" />
        <div v-if="helperText">
            {{ helperText }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'fp-extension-loader',
    props: {
        helperText: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="less" scoped>
.loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
        height: 100px;
    }
}
</style>
