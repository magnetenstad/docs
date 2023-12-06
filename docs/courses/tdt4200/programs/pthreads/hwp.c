#include "stdio.h"
#include "pthread.h"

#define N 500

void *hello(void *args)
{
    int rank = *(int *)args;
    printf("Hello from %d / %d!\n", rank, N);
}

int main(int argc, char *argv[])
{
    pthread_t threads[N];

    for (int i = 0; i < N; i++)
    {
        pthread_create(&threads[i], NULL, hello, &i);
    }

    for (int i = 0; i < N; i++)
    {
        if (pthread_join(threads[i], NULL) != 0)
        {
            perror("pthread_join");
            return 1;
        }
    }
}
