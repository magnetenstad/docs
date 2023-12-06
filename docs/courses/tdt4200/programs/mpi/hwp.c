#include "stdio.h"
#include "mpi.h"

int main(int argc, char *argv[])
{
    int comm_size;
    int rank;

    MPI_Init(&argc, &argv);
    MPI_Comm_size(MPI_COMM_WORLD, &comm_size);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);

    printf("Hello from rank %d / %d\n", rank, comm_size);

    MPI_Finalize();
    return 0;
}
