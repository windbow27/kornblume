<script setup lang="ts">

</script>

<template>
    <dialog id="tutorial" class="modal">
        <div class="modal-box custom-gradient-gray-blue custom-border relative h-2/3">
            <div class="absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue rounded-xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2.5 top-4 text-white">✕</button>
                </form>
                <h3 class="font-bold text-lg text-info p-2">{{ $t('tutorial') }}</h3>
            </div>

            <div class="text-white overflow-y-auto h-full pt-10">
                <p class="py-4 text-white">{{ $t('video-demonstration-tutorial') }} <a
                        href="https://youtu.be/CNsZ4rGWtyY" target="_blank" class="text-blue-500 hover:text-blue-700">{{
                            $t('summon-tracker-demo') }}</a></p>
                <p class=" text-white">1. {{ $t('take-screenshots-of-your-summon-history') }}</p>
                <p class=" text-white">2.
                    <i18n-t
                        scope="global"
                        keypath="upload-the-screenshots-to-the-summon-tracker-you-could-upload-multiple-images-at-once">
                        <template #highlight>
                            <span class="text-error">{{ $t('multiple-images') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class=" text-white">3. {{
                    $t('the-summon-tracker-will-automatically-extract-display-and-save-the-information-from-the-screenshots')
                    }}</p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('tips') }}</h3>
                <p class=" text-white">• {{ $t('it-is-advised-to-save-your-screenshots-for-future-usages') }}</p>
                <p class=" text-white">• {{ $t('after-your-first-import') }}</p>
                <p class="text-white">•
                    <i18n-t scope="global" keypath='this-is-an-example-of-a-good-image'>
                        <template #highlight>
                            <a href="https://imgur.com/a/cHqOqJL" target="_blank"
                                class="text-blue-500 hover:text-blue-700">{{ $t('image') }}</a>
                        </template>
                    </i18n-t>
                </p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('limitations') }}</h3>
                <p class="text-white">•
                    <i18n-t
                        scope="global"
                        keypath="ocr-import-only-works-with-english-text-consider-changing-your-language-into-english-to-screenshot">
                        <template #highlight>
                            <span class="text-error">{{ $t('english-text') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('bug-reports') }}</h3>
                <p class="text-white">• {{ $t('try-legacy') }}</p>
                <p class=" text-white">•
                    <i18n-t
                        scope="global"
                        keypath='if-you-encounter-a-bug-pinpoint-its-location-by-using-missing-information-timestamps'>
                        <template #missing>
                            <span class="text-error">{{ $t('missing-information') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class="text-white">•
                    <i18n-t scope="global" keypath='solution-1'>
                        <template #editor>
                            <span class="text-error">{{ $t('summon-editor') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class="text-sm lg:text-base">{{ $t('tip-for-pc-users-press-f12-after-importing-images-to-see-which-pulls-went-wrong') }} </p>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<style scoped></style>
